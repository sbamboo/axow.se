from pyscript import window, document, js_import, py_import

import re
import js
import math
import json
import requests

def parse(text: str) -> str:
    foreground_colors = {
        "black": "\033[30m",
        "red": "\033[31m",
        "green": "\033[32m",
        "yellow": "\033[33m",
        "blue": "\033[34m",
        "magenta": "\033[35m",
        "cyan": "\033[36m",
        "white": "\033[37m",
        "bright_black": "\033[90m",
        "bright_red": "\033[91m",
        "bright_green": "\033[92m",
        "bright_yellow": "\033[93m",
        "bright_blue": "\033[94m",
        "bright_magenta": "\033[95m",
        "bright_cyan": "\033[96m",
        "bright_white": "\033[97m",
    }
    background_colors = {
        "black": "\033[40m",
        "red": "\033[41m",
        "green": "\033[42m",
        "yellow": "\033[43m",
        "blue": "\033[44m",
        "magenta": "\033[45m",
        "cyan": "\033[46m",
        "white": "\033[47m",
        "bright_black": "\033[100m",
        "bright_red": "\033[101m",
        "bright_green": "\033[102m",
        "bright_yellow": "\033[103m",
        "bright_blue": "\033[104m",
        "bright_magenta": "\033[105m",
        "bright_cyan": "\033[106m",
        "bright_white": "\033[107m",
    }
    global_colors = {
        "reset": "\033[0m",
        "r": "\033[0m"
    }
    
    def replacer(match):
        tag = match.group(1)
        if tag in global_colors:
            return global_colors[tag]
        if tag.startswith("f:"):
            return foreground_colors.get(tag[2:], match.group(0))
        elif tag.startswith("b:"):
            return background_colors.get(tag[2:], match.group(0))
        return foreground_colors.get(tag, match.group(0))
    
    return re.sub(r"%([a-zA-Z0-9_:]+)%", replacer, text)


def execute_inputs(inputs):
    for input_str in inputs:
        input_str = input_str.strip()
        context["state"]["last_query"] = input_str.split(" ")
        if context["state"]["last_query"][0] in context["commands"].keys():
            context["state"]["last_result"] = context["commands"][context["state"]["last_query"][0]]["func"](context)
            last_result = str(context["state"]["last_result"]);
            if last_result.replace(" ","") != "" and last_result != "None":
                print(parse(last_result))
        else:
            print(parse(
              f"{prefix_wyper} %red%Command '"+context['state']['last_query'][0]+f"' not found!%r%"
            ))


def command_help(context):
    return f"""
{context['info']['name']} v.{context['info']['ver']}, Branch: {context['info']['branch']}, Rel: {context['info']['rel']}
-----------------------------------------------
Made by: {context['info']['author']}
-----------------------------------------------
Commands:
{
    '\n'.join(
          ["  "+x+(
              "" if context["commands"][x].get("desc") == None or context["commands"][x].get("desc") == "" else (
                  "   %bright_black%-%r% "+context["commands"][x]["desc"]
              )
          ) for x in context["commands"].keys()]
    )
}
    """

def command_exit(context):
    context["state"]["running"] = False
    print(parse(footer))

def command_clear(context):
    __terminal__.clear()

def command_jwinl(context):
    last_query = context.get("state", {}).get("last_query", [])
    
    if len(last_query) < 3:
        return ""  # If there are not enough elements in the query

    # Extract action and path
    action = last_query[1]
    path = last_query[2]

    query_parts = path.split(".")
  
    # Check if path starts with "$r" for using last_result instead of window
    if path.startswith("$r"):
        window_obj = context.get("state", {}).get("last_result", None)
        if len(query_parts) > 1:
            query_parts = query_parts[1:]
        else:
            query_parts = []
    else:
        window_obj = window  # Default to 'window' if the path doesn't start with "$r"
    
    # Traverse the path to get the desired object
    for part in query_parts:
        if window_obj is None or not hasattr(window_obj, part):
            return ""  # If at any point the attribute doesn't exist or window_obj is None, return an empty string
        window_obj = getattr(window_obj, part)

    # Perform actions based on the action in the second argument
    if action == "get":
        return str(window_obj)  # Return the value of the found object as a string

    elif action == "list":
        # Return a list of attributes of the found object
        return [attr for attr in dir(window_obj) if not attr.startswith("__")]
    
    elif action == "modx.add":
        if len(last_query) < 5:
            return ""  # If there's no value to add
        
        value = last_query[4]
        
        if hasattr(window_obj, last_query[3]):
            # If the attribute exists, update it
            setattr(window_obj, last_query[3], value)
        else:
            # If the attribute does not exist, add it
            setattr(window_obj, last_query[3], value)
    
    elif action == "modx.del":
        if len(last_query) < 4:
            return ""  # If there is no attribute to delete
        
        attr_to_delete = last_query[3]
        
        if hasattr(window_obj, attr_to_delete):
            delattr(window_obj, attr_to_delete)
    
    elif action == "act":
        if len(last_query) < 4:
            return ""  # If there's no function to execute
        
        function_call = last_query[3]
        
        try:
            result = eval(f"window_obj{function_call}")
            return str(result)  # Return the result of executing the function
        except Exception as e:
            return ""  # If execution fails, return an empty string
    
    return ""

def command_jwin(context):
    # [jwin helper code]
    def split_unipath(unipath):
        parts = []
        buffer = ""
        in_quotes = False

        for char in unipath:
            if char == '"':
                in_quotes = not in_quotes
            elif char == '.' and not in_quotes:
                parts.append(buffer)
                buffer = ""
            else:
                buffer += char
        
        if buffer:
            parts.append(buffer)

        return [int(part[1:-1]) if re.match(r"^\[\d+\]$", part) else part.strip('"') for part in parts]

    def get_by_unipath(root, unipath):
        keys = split_unipath(unipath)
        current = root
        
        for key in keys:
            if isinstance(key, int) and isinstance(current, list):
                if 0 <= key < len(current):
                    current = current[key]
                else:
                    return None
            elif isinstance(current, dict) and key in current:
                current = current[key]
            elif hasattr(current, key):
                current = getattr(current, key)
            else:
                return None
        return current

    def set_by_unipath(root, unipath, value, ensure=False, require_attr=False):
        keys = split_unipath(unipath)
        current = root

        for i, key in enumerate(keys[:-1]):
            next_key = keys[i + 1] if i + 1 < len(keys) else None
            if isinstance(key, int) and isinstance(current, list):
                if key >= len(current):
                    if ensure:
                        current.extend([[] if isinstance(next_key, int) else (object() if require_attr else {})] * (key + 1 - len(current)))
                    else:
                        return False
                current = current[key]
            elif isinstance(current, dict):
                if key not in current:
                    if ensure:
                        current[key] = [] if isinstance(next_key, int) else (object() if require_attr else {})
                    else:
                        return False
                current = current[key]
            elif hasattr(current, key):
                current = getattr(current, key)
            elif ensure:
                setattr(current, key, [] if isinstance(next_key, int) else (object() if require_attr else {}))
                current = getattr(current, key)
            else:
                return False

        last_key = keys[-1]
        if isinstance(last_key, int) and isinstance(current, list):
            if last_key >= len(current):
                if ensure:
                    current.extend([None] * (last_key + 1 - len(current)))
                else:
                    return False
            current[last_key] = value
        elif isinstance(current, dict):
            current[last_key] = value
        else:
            setattr(current, last_key, value)
        
        return True

    def del_by_unipath(root, unipath):
        keys = split_unipath(unipath)
        current = root

        for i, key in enumerate(keys[:-1]):
            if isinstance(key, int) and isinstance(current, list):
                if 0 <= key < len(current):
                    current = current[key]
                else:
                    return False
            elif isinstance(current, dict) and key in current:
                current = current[key]
            elif hasattr(current, key):
                current = getattr(current, key)
            else:
                return False
        
        last_key = keys[-1]
        if isinstance(last_key, int) and isinstance(current, list):
            if 0 <= last_key < len(current):
                del current[last_key]
                return True
        elif isinstance(current, dict) and last_key in current:
            del current[last_key]
            return True
        elif hasattr(current, last_key):
            delattr(current, last_key)
            return True
        
        return False

    # [Main jwin code]
    last_query = context.get("state", {}).get("last_query", [])
    
    if len(last_query) < 2:
        raise Exception("jwin <action> <opt:path> <opt:value/opt:dest_path> (NO_ACTION)")  # Not enough elements in the query (just action as param)

    action = last_query[1]
    path = last_query[2] if len(last_query) > 2 else ""
    value = last_query[3] if len(last_query) > 3 else None

    if path in (".", "*"):
        path = ""
    elif path.startswith("$r."):
        root_object = context.get("state", {}).get("last_result", None)
        path = path[3:]
    elif path == "$r":
        root_object = context.get("state", {}).get("last_result", None)
        path = ""
    else:
        root_object = window
    
    if action.startswith("modx.set"):
        if value is None:
            raise Exception("jwin modx.set <<path>/'.'> <value> (NO_VALUE)")  # Missing value
        
        if value == "$r":
            value = context.get("state", {}).get("last_result", None)
        elif isinstance(value, str):
            value = value.replace("%sc%", ";").replace("%nl%", "\n").replace("%s%", " ")
      
        success = set_by_unipath(root_object, path, value, ensure=True, require_attr=action.endswith(":attr")) if path else root_object
        if success != True:
            raise Exception(f"Failed to modify using unipath: 'path'")

    elif action == "modx.del":
        success = del_by_unipath(root_object, path) if path else False
        if not success:
            raise Exception(f"Failed to delete using unipath: 'path'")

    elif action == "modx.merge":
        if value is None:
            raise Exception("jwin modx.merge <path> <dest_path> (NO_DEST_PATH)")  # Missing destination path (value)
        
        # Get the value at the provided path
        current_value = get_by_unipath(root_object, path)
        
        if current_value is None:
            raise Exception(f"Value at path '{path}' is None. Cannot merge.")
        
        # Merge the retrieved value at path with the destination path (value)
        success = set_by_unipath(root_object, value, current_value, ensure=True)
        
        if not success:
            raise Exception(f"Failed to merge using unipath: '{path}' -> '{value}'")

    # Check for get and modx.get actions
    elif action.startswith("get") or action.startswith("modx.get"):
        if not path:
            raise Exception("jwin get <path> (NO_PATH)")  # Missing path
        
        # :type return
        if action.endswith(":type"):
            if not path:
                raise Exception("jwin get:type <path> (NO_PATH)")  # Missing path
            
            # Get the value at the given path
            result = get_by_unipath(root_object, path)
            
            if result is None:
                return None  # Return None if value is None
            
            # Return the type of the value
            return type(result).__name__

        # general return
        return get_by_unipath(root_object, path)

    # Check for list and modx.list actions
    elif action.startswith("list") or action.startswith("modx.list"):
        if not path:
            raise Exception("jwin list <path> (NO_PATH)")  # Missing path
        
        # Get the value at the given path
        result = get_by_unipath(root_object, path)
        
        # :type return
        if action.endswith(":type"):
            if not path:
                raise Exception("jwin list:type <path> (NO_PATH)")  # Missing path
            
            # Get the value at the given path
            result = get_by_unipath(root_object, path)
            
            if result is None:
                return None  # Return None if value is None
            
            # Return the type of the value
            return type(result).__name__

        # general return
        if result is None:
            return []  # Return empty list if value is None
        
        if isinstance(result, list):
            return list(range(len(result)))  # Return list of indexes if value is a list
        
        elif isinstance(result, dict):
            return list(result.keys())  # Return list of keys if value is a dict
        
        else:
            # Return list of attributes for other types
            return [attr for attr in dir(result) if not attr.startswith('__')]
    
    elif action == "modx.str_replace":
        if len(last_query) < 5:
            raise Exception("jwin modx.str_replace <path> <replace> <with> (INSUFFICIENT_ARGUMENTS)")

        replace = last_query[3]
        with_value = last_query[4]
        
        # Handle special cases for %sc%, %nl%, %s%
        replace = replace.replace("%sc%", ";").replace("%nl%", "\n").replace("%s%", " ")
        with_value = with_value.replace("%sc%", ";").replace("%nl%", "\n").replace("%s%", " ")

        if replace == "$r":
            last_result = context.get("state", {}).get("last_result", None)
            if isinstance(last_result, str):
                replace = last_result
            else:
                raise Exception("Last result is not a string. Cannot replace with '$r'")

        if with_value == "$r":
            last_result = context.get("state", {}).get("last_result", None)
            if isinstance(last_result, str):
                with_value = last_result
            else:
                raise Exception("Last result is not a string. Cannot replace with '$r'")

        # Get the value at the provided path
        current_value = get_by_unipath(root_object, path)
        
        if current_value is None:
            raise Exception(f"Value at path '{path}' is None. Cannot perform string replace.")

        if isinstance(current_value, str):
            # Perform string replacement
            new_value = current_value.replace(replace, with_value)
            success = set_by_unipath(root_object, path, new_value)
            if not success:
                raise Exception(f"Failed to modify value at path '{path}'")
        else:
            raise Exception(f"Value at path '{path}' is not a string. Cannot perform string replace.")

    elif action == "modx.act":
        if len(last_query) < 4:
            raise Exception("jwin modx.act <path> <ext> (INSUFFICIENT_ARGUMENTS)")

        act = last_query[3]

        # general return
        result = get_by_unipath(root_object, path)
        
        if result is None:
            raise Exception(f"Value at path '{path}' is None. Cannot perform act '{act}'.")

        try:
            result = eval(f"root_object{act}")
        except Exception as e:
            raise Exception(f"%red%An error occured while attempting to act '{act}' on '{path}'\n{e}\n%bright_black%==========[P.ACT]==========\nroot_object{act}\n==========[P.ACT]==========%r%")
        return result  # Return the result of executing the function

    elif action == "modx.jsact":
        if len(last_query) < 4:
            raise Exception("jwin modx.jsact <path> <ext> (INSUFFICIENT_ARGUMENTS)")

        act = last_query[3]

        # general return
        result = get_by_unipath(root_object, path)
        
        if result is None:
            raise Exception(f"Value at path '{path}' is None. Cannot perform js-act '{act}'.")

        try:
            result = js.eval(f"root_object{act}")
        except Exception as e:
            raise Exception(f"%red%An error occured while attempting to js-act '{act}' on '{path}'\n{e}\n%bright_black%==========[P.JSACT]==========\nroot_object{act}\n==========[P.JSACT]==========%r%")
        return result  # Return the result of executing the function

    elif action == "modx.act:save":
        if len(last_query) < 4:
            raise Exception("jwin modx.act:save <path> <ext> (INSUFFICIENT_ARGUMENTS)")

        act = last_query[3]

        # general return
        result = get_by_unipath(root_object, path)
        
        if result is None:
            raise Exception(f"Value at path '{path}' is None. Cannot perform savingly act '{act}'.")

        try:
            result = eval(f"root_object{act}")
        except Exception as e:
            raise Exception(f"%red%An error occured while attempting to savingly act '{act}' on '{path}'\n{e}\n%bright_black%==========[P.ACT]==========\nroot_object{act}\n==========[P.ACT]==========%r%")

        success = set_by_unipath(root_object, path, result)

        if not success:
            raise Exception(f"Failed to savingly act '{act}' using unipath: '{path}' -> '{value}'\n%bright_black%==========[P.ACT]==========\nroot_object{act}\n==========[P.ACT]==========%r%")

    return ""

def command_jcon(context):
    window.console.log(' '.join(context["state"]["last_query"][1:]))

def command_pyval(context):
    try:
        code = ' '.join(context["state"]["last_query"][1:]).replace("%sc%",";")
        # Replace %nl% placeholders with actual newlines
        code = code.replace("%nl%", "\n")
        # Strip out lines that are empty or start with a comment
        processed_code = "\n".join(
            line for line in code.splitlines() if line.strip() and not line.strip().startswith("#")
        )
        result = exec(processed_code)
        return str(result) if result is not None else ""
    except Exception as e:
        return f"%red%Error in pyval: {e}%r%"

def command_jval(context):
    js.eval(' '.join(context["state"]["last_query"][1:]).replace("%sc%",";"))

def command_nav(context):
    last_query = context["state"]["last_query"]
    if len(last_query) <= 2: return None
    action = context["state"]["last_query"][1]

    if action == "refresh" or action == "reload":
        window.location.reload()
    elif action == "to":
        if len(last_query) <= 3: return None
        if len(last_query) == 4:
            window.open(last_query[2],last_query[3])
        else:
            window.open(last_query[2])

def command_print(context):
    print(parse(' '.join(context["state"]["last_query"][1:])))

def command_frwork(context):
    last_query = context.get("state", {}).get("last_query", [])
    canvas = js.document.querySelector("#drawarea")
    ctx = canvas.getContext("2d")

    if len(last_query) < 2:
        return ""

    action = last_query[1]

    # Resize canvas action
    if action == "resize":
        frwork_draw_resize_canvas()

    # Clear canvas action
    elif action == "clear":
        ctx.fillStyle = "#191a19"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

    # Fill canvas with a specific color
    elif action == "fill":
        if len(last_query) < 3:
            return ""
        color = last_query[2]
        ctx.fillStyle = color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
  
    # Image fetch and draw-fill (fills entire canvas)
    elif action == "imgfill":
        if len(last_query) < 3:
            return ""
        img_url = last_query[2]
        window.draw_image_on_canvas(img_url)

    # Image fetch and draw at x, y (optionally with width and height)
    elif action == "img":
        if len(last_query) < 5:
            return ""
        try:
            img_url = last_query[2]
            x, y = map(int, last_query[3:5])
            
            # If width and height are provided
            if len(last_query) >= 7:
                w, h = map(int, last_query[5:7])
                window.draw_image_on_canvas(img_url, x, y, w, h)
            else:
                window.draw_image_on_canvas(img_url, x, y)
        except ValueError:
            return ""

    # Draw square with 2 points (x1, y1, x2, y2)
    elif action == "square":
        if len(last_query) < 6:
            return ""
        try:
            x1, y1, x2, y2 = map(int, last_query[2:6])
            color = last_query[6]
            ctx.fillStyle = color
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
        except ValueError:
            return ""

    # Draw square with width and height (x, y, width, height)
    elif action == "squareWH":
        if len(last_query) < 5:
            return ""
        try:
            x, y, w, h = map(int, last_query[2:6])
            color = last_query[6]
            ctx.fillStyle = color
            ctx.fillRect(x, y, w, h)
        except ValueError:
            return ""

    # Draw triangle with 3 points (x1, y1, x2, y2, x3, y3)
    elif action == "triangle":
        if len(last_query) < 8:
            return ""
        try:
            x1, y1, x2, y2, x3, y3 = map(int, last_query[2:8])
            color = last_query[8]
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.lineTo(x3, y3)
            ctx.closePath()
            ctx.fill()
        except ValueError:
            return ""

    # Draw circle with center (x, y) and radius (r)
    elif action == "circle":
        if len(last_query) < 5:
            return ""
        try:
            x, y, r = map(int, last_query[2:5])
            color = last_query[5]
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, r, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.fill()
        except ValueError:
            return ""

    # Draw line from (x1, y1) to (x2, y2)
    elif action == "line":
        if len(last_query) < 6:
            return ""
        try:
            x1, y1, x2, y2 = map(int, last_query[2:6])
            color = last_query[6]
            ctx.strokeStyle = color
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
        except ValueError:
            return ""

    # Draw arc (part of a circle) with center (x, y), radius (r), start angle, and end angle
    elif action == "arc":
        if len(last_query) < 7:
            return ""
        try:
            x, y, r, start_angle, end_angle = map(int, last_query[2:7])
            color = last_query[7]
            ctx.strokeStyle = color
            ctx.beginPath()
            ctx.arc(x, y, r, start_angle, end_angle)
            ctx.stroke()
        except ValueError:
            return ""

    # Draw ellipse with center (x, y), radii (rx, ry), rotation angle, and start and end angles
    elif action == "ellipse":
        if len(last_query) < 6:
            return ""
        try:
            x, y, rx, ry = map(int, last_query[2:6])
            rotation = int(last_query[6]) if len(last_query) > 6 else 0
            start_angle = int(last_query[7]) if len(last_query) > 7 else 0
            end_angle = int(last_query[8]) if len(last_query) > 8 else 2 * math.pi  # Use math.pi here
            color = last_query[9] if len(last_query) > 9 else "white"
            
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.ellipse(x, y, rx, ry, rotation, start_angle, end_angle)
            ctx.closePath()
            ctx.fill()
        except ValueError:
            return ""

    # Draw polygon with a list of points
    elif action == "polygon":
        if len(last_query) < 4:
            return ""
        try:
            points = [(int(last_query[i]), int(last_query[i + 1])) for i in range(2, len(last_query) - 1, 2)]
            color = last_query[-1]
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(points[0][0], points[0][1])
            for point in points[1:]:
                ctx.lineTo(point[0], point[1])
            ctx.closePath()
            ctx.fill()
        except ValueError:
            return ""

    # Set line width
    elif action == "lineWidth":
        if len(last_query) < 3:
            return ""
        try:
            width = int(last_query[2])
            ctx.lineWidth = width
        except ValueError:
            return ""

    # Set stroke color
    elif action == "strokeColor":
        if len(last_query) < 3:
            return ""
        color = last_query[2]
        ctx.strokeStyle = color

    # Set fill color
    elif action == "fillColor":
        if len(last_query) < 3:
            return ""
        color = last_query[2]
        ctx.fillStyle = color

    # Draw text on canvas at (x, y) with optional color, font size, and font family
    elif action == "text":
        if len(last_query) < 5:
            return ""
        try:
            text = last_query[2].replace("%s%"," ")
            x, y = map(int, last_query[3:5])
            color = last_query[5] if len(last_query) > 5 else "#FFFFFF"  # Default white
            font_size = last_query[6] if len(last_query) > 6 else "16px"  # Default 16px
            font_family = last_query[7].replace("%s%"," ") if len(last_query) > 7 else "Arial"  # Default Arial

            ctx.fillStyle = color
            ctx.font = f"{font_size} {font_family}"
            ctx.fillText(text, x, y)
        except ValueError:
            return ""
  
    return ""

def command_demo(context):
    execute_inputs(context["demo"]["input"])

def command_reset(context):
    #clear
    __terminal__.clear()
    #frwork clear
    canvas = js.document.querySelector("#drawarea")
    ctx = canvas.getContext("2d")
    ctx.fillStyle = "#191a19"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    #header
    print(parse(header))
    #demo
    execute_inputs(context["demo"]["input"])

def command_ctx(context):
    """
    Implements the 'ctx' command with the following actions:
      - ctx get [<keypath>]
            (if <keypath> is omitted or empty, returns the entire context)
      - ctx set [<keypath>] <value>
            (if <keypath> is omitted or empty, sets the entire context; value must be a dict)
      - ctx del [<keypath>]
            (if <keypath> is omitted or empty, clears the entire context)
      - ctx merge [<dest_keypath>] <src_keypath>
            (if <dest_keypath> is omitted or empty, uses the root context as destination)
      - ctx export
            (exports the entire context as a JSON file download, replacing functions with markers)
      - ctx import <url>
            (imports JSON from a URL, restoring functions from markers, and replaces the entire context)
    
    When <keypath> is an empty string, the root context is used.
    """

    # [ctx helper code]
    def parse_keypath(keypath: str):
        """Parses a dot-separated keypath, converting segments wrapped in [ ] to integers if possible."""
        parts = keypath.split('.')
        keys = []
        for part in parts:
            if part.startswith('[') and part.endswith(']'):
                inner = part[1:-1]
                try:
                    key = int(inner)
                except ValueError:
                    key = inner  # fallback to string if conversion fails
            else:
                key = part
            keys.append(key)
        return keys

    def evaluate_value(s: str):
        """
        Evaluates a value string:
        - Unquoted "True", "False", "None", numbers are converted to their respective types.
        - If the value is wrapped in quotes (single or double), it is treated as a string.
        """
        if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
            return s[1:-1]
        if s == "True":
            return True
        if s == "False":
            return False
        if s == "None":
            return None
        try:
            return int(s)
        except ValueError:
            pass
        try:
            return float(s)
        except ValueError:
            pass
        return s

    def get_by_keypath(root, keypath, create_missing=False):
        """
        Traverses the keypath in the root (a dict or list).
        If create_missing is True, intermediate keys are created (as dicts or lists) if needed.
        """
        keys = parse_keypath(keypath)
        current = root
        for i, key in enumerate(keys):
            if isinstance(current, list) and isinstance(key, int):
                if key < 0 or key >= len(current):
                    if create_missing:
                        # Determine container type for the next key:
                        next_container = {} if (i + 1 < len(keys) and not isinstance(keys[i+1], int)) else []
                        while len(current) <= key:
                            current.append(next_container)
                    else:
                        raise KeyError(f"Index {key} out of range")
                current = current[key]
            elif isinstance(current, dict):
                if key not in current:
                    if create_missing:
                        next_container = {} if (i + 1 < len(keys) and not isinstance(keys[i+1], int)) else []
                        current[key] = next_container
                    else:
                        raise KeyError(f"Key '{key}' not found")
                current = current[key]
            else:
                raise KeyError(f"Cannot traverse key '{key}' in non-collection")
        return current

    def set_by_keypath(root, keypath, value):
        """
        Ensures that the entire keypath exists (creating intermediate containers if needed)
        and sets the final key to the given value.
        """
        keys = parse_keypath(keypath)
        current = root
        for i, key in enumerate(keys[:-1]):
            if isinstance(current, list) and isinstance(key, int):
                if key < 0 or key >= len(current):
                    next_container = {} if (i + 1 < len(keys) and not isinstance(keys[i+1], int)) else []
                    while len(current) <= key:
                        current.append(next_container)
                if current[key] is None:
                    next_container = {} if (i + 1 < len(keys) and not isinstance(keys[i+1], int)) else []
                    current[key] = next_container
                current = current[key]
            elif isinstance(current, dict):
                if key not in current:
                    next_container = {} if (i + 1 < len(keys) and not isinstance(keys[i+1], int)) else []
                    current[key] = next_container
                current = current[key]
            else:
                raise KeyError(f"Cannot traverse key '{key}' in non-collection")
        last_key = keys[-1]
        if isinstance(current, list) and isinstance(last_key, int):
            while len(current) <= last_key:
                current.append(None)
        current[last_key] = value

    def delete_by_keypath(root, keypath):
        """
        Deletes the element specified by the keypath from the root.
        """
        keys = parse_keypath(keypath)
        if not keys:
            raise KeyError("Empty keypath")
        current = root
        for key in keys[:-1]:
            if isinstance(current, list) and isinstance(key, int):
                if key < 0 or key >= len(current):
                    raise KeyError(f"Index {key} out of range")
                current = current[key]
            elif isinstance(current, dict):
                if key not in current:
                    raise KeyError(f"Key '{key}' not found")
                current = current[key]
            else:
                raise KeyError(f"Cannot traverse key '{key}' in non-collection")
        last_key = keys[-1]
        if isinstance(current, list) and isinstance(last_key, int):
            if last_key < 0 or last_key >= len(current):
                raise KeyError(f"Index {last_key} out of range")
            del current[last_key]
        elif isinstance(current, dict):
            if last_key not in current:
                raise KeyError(f"Key '{last_key}' not found")
            del current[last_key]
        else:
            raise KeyError("Cannot delete key from non-collection")

    def merge_values(dest, src):
        """
        Merges src into dest:
        - If both are dicts, the keys in src update dest (merging recursively).
        - If both are lists, src is appended to dest.
        - Otherwise, src replaces dest.
        """
        if isinstance(dest, dict) and isinstance(src, dict):
            for k, v in src.items():
                if k in dest and isinstance(dest[k], dict) and isinstance(v, dict):
                    dest[k] = merge_values(dest[k], v)
                else:
                    dest[k] = v
            return dest
        elif isinstance(dest, list) and isinstance(src, list):
            dest.extend(src)
            return dest
        else:
            return src

    def replace_functions_for_export(obj):
        """
        Recursively traverses an object and replaces any callable (function)
        with a string in the format "%func:<function_name>%".
        """
        if callable(obj):
            try:
                func_name = obj.__name__
            except Exception:
                func_name = "unknown"
            return f"%func:{func_name}%"
        elif isinstance(obj, dict):
            new_dict = {}
            for key, value in obj.items():
                new_dict[key] = replace_functions_for_export(value)
            return new_dict
        elif isinstance(obj, list):
            return [replace_functions_for_export(item) for item in obj]
        else:
            return obj

    def replace_functions_for_import(obj):
        """
        Recursively traverses an object and replaces any string matching the
        pattern "%func:<function_name>%" with the actual function object (from globals).
        """
        if isinstance(obj, str):
            m = re.fullmatch(r"%func:([a-zA-Z0-9_]+)%", obj)
            if m:
                func_name = m.group(1)
                # Look up the function by name from globals()
                return globals().get(func_name, obj)
            else:
                return obj
        elif isinstance(obj, dict):
            new_dict = {}
            for key, value in obj.items():
                new_dict[key] = replace_functions_for_import(value)
            return new_dict
        elif isinstance(obj, list):
            return [replace_functions_for_import(item) for item in obj]
        else:
            return obj

    # [ctx main code]

    last_query = context.get("state", {}).get("last_query", [])
    
    if len(last_query) < 2:
        return "Usage: ctx <action> [<keypath>] [<value>]"
    
    action = last_query[1]
    
    # ----------------- GET -----------------
    if action == "get":
        keypath = last_query[2] if len(last_query) >= 3 else ""
        if keypath == "":
            return str(context)
        try:
            value = get_by_keypath(context, keypath, create_missing=False)
            return str(value)
        except Exception as e:
            return f"Error: {e}"
    
    # ----------------- SET -----------------
    elif action == "set":
        if len(last_query) < 3:
            return "Usage: ctx set [<keypath>] <value>"
        if len(last_query) == 3:
            keypath = ""
            value_str = last_query[2]
        else:
            keypath = last_query[2]
            value_str = ' '.join(last_query[3:])
        value = evaluate_value(value_str)
        if keypath == "":
            if isinstance(value, dict):
                context.clear()
                context.update(value)
                return f"Set root context to {value}"
            else:
                return "Error: when setting the root context, the value must be a dictionary"
        else:
            try:
                set_by_keypath(context, keypath, value)
                return f"Set {keypath} to {value}"
            except Exception as e:
                return f"Error: {e}"
    
    # ----------------- DEL -----------------
    elif action == "del":
        keypath = last_query[2] if len(last_query) >= 3 else ""
        if keypath == "":
            context.clear()
            return "Cleared root context"
        try:
            delete_by_keypath(context, keypath)
            return f"Deleted {keypath}"
        except Exception as e:
            return f"Error: {e}"
    
    # ----------------- MERGE -----------------
    elif action == "merge":
        if len(last_query) < 3:
            return "Usage: ctx merge [<dest_keypath>] <src_keypath>"
        if len(last_query) == 3:
            dest_keypath = ""
            src_keypath = last_query[2]
        else:
            dest_keypath = last_query[2]
            src_keypath = last_query[3]
        
        if dest_keypath == "":
            dest_obj = context
        else:
            try:
                dest_obj = get_by_keypath(context, dest_keypath, create_missing=True)
            except Exception as e:
                return f"Error: {e}"
        
        if src_keypath == "":
            src_obj = context
        else:
            try:
                src_obj = get_by_keypath(context, src_keypath, create_missing=False)
            except Exception as e:
                return f"Error: {e}"
        
        merged = merge_values(dest_obj, src_obj)
        if dest_keypath == "":
            if isinstance(merged, dict):
                context.clear()
                context.update(merged)
                return f"Merged root context with {src_keypath if src_keypath != '' else 'root'}"
            else:
                return "Error: when merging into the root context, the merged value must be a dictionary"
        else:
            try:
                set_by_keypath(context, dest_keypath, merged)
                return f"Merged {src_keypath} into {dest_keypath}"
            except Exception as e:
                return f"Error: {e}"
    
    # ----------------- EXPORT -----------------
    elif action == "export":
        try:
            # Replace all function objects with markers before serializing
            export_context = replace_functions_for_export(context)
            export_context["state"]["last_result"] = ""
            json_str = json.dumps(export_context, indent=4)
            # Create a Blob from the JSON string and trigger a download
            blob = js.Blob.new([json_str], { "type": "application/json" })
            url = js.URL.createObjectURL(blob)
            a = js.document.createElement("a")
            a.href = url
            a.download = "context.json"
            js.document.body.appendChild(a)
            a.click()
            js.document.body.removeChild(a)
            return "Exported context as context.json"
        except Exception as e:
            return f"Error during export: {e}"
    
    # ----------------- IMPORT -----------------
    elif action == "import":
        if len(last_query) < 3:
            return "Usage: ctx import <url>"
        url_arg = last_query[2]
        try:
            response = requests.get(url_arg)
            new_context = response.json()
            # Restore functions from markers
            new_context = replace_functions_for_import(new_context)
            if isinstance(new_context, dict):
                context.clear()
                context.update(new_context)
                return "Imported context successfully"
            else:
                return "Error: Imported JSON is not an object/dictionary"
        except Exception as e:
            return f"Error during import: {e}"
    
    else:
        return f"Unknown action '{action}' in ctx command"

def command_iwpy(context):
    """
    Fetches Python code from a URL and evaluates it using eval(...).
    If the response content type is 'application/octet-stream', it decodes the content as UTF-8.
    Example: "iwpy https://example.com/script.py"
    """
    last_query = context["state"]["last_query"]
    if len(last_query) < 2:
        return "Error: No URL provided."
    url = last_query[1]
    try:
        response = requests.get(url)
        content_type = response.headers.get("Content-Type", "")
        code = response.content.decode('utf-8') if "application/octet-stream" in content_type else response.text
        # Strip out lines that are empty or start with a comment
        processed_code = "\n".join(
            line for line in code.splitlines() if line.strip() and not line.strip().startswith("#")
        )
        result = exec(processed_code)
        return str(result)
    except Exception as e:
        return f"%red%Error in iwpy: {e}"+"%blue%\n===========[CODE]===========\n"+code+"\n===========[CODE]===========\n"+"%bright_black%\n===========[P.CODE]===========\n"+processed_code+"\n===========[P.CODE]===========\n%r%"


def command_iwjs(context):
    """
    Fetches JavaScript code from a URL and evaluates it using js.eval(...).
    If the response content type is 'application/octet-stream', it decodes the content as UTF-8.
    Example: "iwjs https://example.com/script.js"
    """
    last_query = context["state"]["last_query"]
    if len(last_query) < 2:
        return "Error: No URL provided."
    url = last_query[1]
    try:
        response = requests.get(url)
        content_type = response.headers.get("Content-Type", "")
        code = response.content.decode('utf-8') if "application/octet-stream" in content_type else response.text
        result = js.eval(code)
        return str(result)
    except Exception as e:
        return f"%red%Error in iwjs: {e}"+"%blue%\n===========[CODE]===========\n"+code+"\n===========[CODE]===========\n"

def command_pyim(context):
    """
    Imports one or more Python modules using pyscript.py_import and stores
    them in context["storage"]["py_import"].
    Example: "pyim requests"
    """
    last_query = context["state"]["last_query"]
    if len(last_query) < 2:
        return "Error: No module names provided."
    modules = last_query[1:]
    try:
        imported_modules = py_import(*modules)
        if "storage" not in context:
            context["storage"] = {"py_import": {}, "js_import": {}}
        if "py_import" not in context["storage"]:
            context["storage"]["py_import"] = {}
        for mod_name, mod_obj in zip(modules, imported_modules):
            context["storage"]["py_import"][mod_name] = mod_obj
        return f"Python modules imported: {', '.join(modules)}"
    except Exception as e:
        return f"Error in pyim: {e}"

def command_jsim(context):
    """
    Imports one or more JS modules using pyscript.js_import and stores
    them in context["storage"]["js_import"].
    Example: "jsim https://esm.run/html-escaper"
    """
    last_query = context["state"]["last_query"]
    if len(last_query) < 2:
        return "Error: No module URLs provided."
    modules = last_query[1:]
    try:
        imported_modules = js_import(*modules)
        if "storage" not in context:
            context["storage"] = {"py_import": {}, "js_import": {}}
        if "js_import" not in context["storage"]:
            context["storage"]["js_import"] = {}
        for mod_url, mod_obj in zip(modules, imported_modules):
            mod_name = mod_url
            if "/" in mod_url:
                mod_name = mod_url.split("/")[-1]
            context["storage"]["js_import"][mod_name] = mod_obj
        return f"JS modules imported: {', '.join(modules)}"
    except Exception as e:
        return f"Error in jsim: {e}"

def command_todo(context):
    todo = [
        "if / loop statements.",
        "variables. %bright_black%(Currently we can use 'ctx storage.vars')",
        "dom command allowing management of the DOM tree with the concept of html elements. %bright_black%('dom' command, to do common dom manulpulation including css and event handling)",
        "allow toggling frwork canvas 'frwork toggle' 'frwork enable' 'frwork disable'",
        "add emulated fs %bright_black%(fully emulated)",
        "add fs connection for the pyscript sandbox %bright_black%(python avaliable fs/env)",
        "Make 'jwin modx.jsact ...' use a function defined in <script> tag to parse the unipath and act from JS. So make jsact use wrap the function call.",
        "Test making 'nav reload/refresh' use a func defined in a <script> tag to reload the page.",
        "Command for managing url parameters.",
        "Add type-specific operations to 'ctx' like str-index, str-replace, splitting etc."
    ]
    return "%green%Todo of Wyper for 2025-02-17 %bright_black%(rev.1)\n %magenta%- %blue%"+"\n %magenta%- %blue%".join(todo)+"%r%"



context = {
    "demo": {
        "input": [
            "frwork text @sbamboo 10 110 magenta",
            "frwork img https://axow.se/assets/images/site_logo.png 10 10 100 100",
            "frwork text Content%s%can%s%be%s%drawn%s%here%s%using%s%the%s%'frwork'%s%command. 10 300 gray"
        ],
        "is_shown": False
    },
    "info": {
        "name": "Wyper",
        "ver": "0.0",
        "branch": "bolt-eval",
        "rel": "2025-02-15",
        "author": "@sbamboo"
    },
    "commands": {
        "help": {
            "func": command_help,
            "desc": "%blue%Shows this help menu.%r%"
        },
        "print": {
            "func": command_print,
            "desc": "%blue%Prints to terminal. %magenta%'print <text>'%r%"
        },
        "clear": {
            "func": command_clear,
            "desc": "%blue%Cleans the terminal.%r%"
        },
        "jwinl": {
            "func": command_jwinl,
            "desc": "%magenta%'jwinl get <path>' 'jwinl list <path>' 'jwinl modx.add <attr> <value>' 'jwinl modx.del <attr>' 'jwinl act <path> <act>' %blue%<path> can be or start with $r for last result. %bright_black%(Legacy version of 'jwin')%r%"
        },
        "jwin": {
            "func": command_jwin,
            "desc": "%magenta%'jwin get <path>' 'jwin get:type <path>' 'jwin list <path>' 'jwin list:type <path>' 'jwin modx.set <path>/. <value>' 'jwin modx.del <path>' 'jwin modx.merge <path> <dest_path>' 'jwin modx.str_replace <path> <replace> <with>' 'jwin modx.act <path> <ext>' 'jwin modx.jsact <path> <ext>' 'jwin modx.act:save <path> <ext>' %blue%<path> can be or start with $r for last result.%r%"
        },
        "jcon": {
            "func": command_jcon,
            "desc": "%blue%Logs to JS console. %magenta%'jcon <text>'%r%"
        },
        "jval": {
            "func": command_jval,
            "desc": "%blue%Runs python code. %magenta%'jval <ext>'%r%"
        },
        "pyval": {
            "func": command_pyval,
            "desc": "%blue%Runs JS code. %magenta%'pyval <ext>'%r%"
        },
        "nav": {
            "func": command_nav,
            "desc": "%blue%Handles web-navigation. %magenta%'nav refresh' 'nav to <url>' 'nav to <url> _blank'%r%"
        },
        "frwork": {
            "func": command_frwork,
            "desc": "%blue%Handles the frwork canvas. %magenta%'frwork resize' 'frwork clear' 'frwork fill <color>' 'frwork imgfill <img>' 'frwork img <img> <x> <y> <opt:w> <opt:h>' 'frwork square <x1> <y1> <x2> <y2> <color>' 'frwork squareWH <x> <y> <w> <h> <color>' 'frwork triangle <x1> <y1> <x2> <y2> <x3> <y3> <color>' 'frwork circle <x> <y> <rad> <color>' 'frwork line <x1> <y1> <x2> <y2> <color>' 'frwork arc <x> <y> <rad> <color>' 'frwork ellipse <x> <y> <rx> <ry> <opt:rot> <opt:sa> <opt:ea> <color>' 'frwork polyhon <...xy...> <color>' 'frwork lineWidth <int>' 'frwork strokeColor <int>' 'frwork fillColor <color>' 'frwork text <text> <x> <y> <color> <opt:fontSize> <opt:fontFamily>'%r%"
        },
        "ctx": {
            "func": command_ctx,
            "desc": "%blue%Allows manipulation of the wyoper context.%r%"
        },
        "exit": {
            "func": command_exit,
            "desc": "%blue%Exits to frwork wrapping enviroment. %bright_black%('?' here to view commands)%r%"
        },
        "demo": {
            "func": command_demo,
            "desc": "%bright_black%(internal)%r%"
        },
        "reset": {
            "func": command_reset,
            "desc": "%blue%Resets Wyper.%r%"
        },
        "iwpy": {
            "func": command_iwpy,
            "desc": "%blue%Fetches Python code from a URL and evaluates. %yellow%(UNSAFE)\033[0m%magenta% 'iwpy https://example.com/script.py'%r%"
        },
        "iwjs": {
            "func": command_iwjs,
            "desc": "%blue%Fetches JS code from a URL and evaluates it. %yellow%(UNSAFE)\033[0m%magenta% 'iwjs https://example.com/script.js'%r%"
        },
        "pyim": {
            "func": command_pyim,
            "desc": "%blue%Imports Python modules to wyper storage. %magenta%'pyim requests'%r%"
        },
        "jsim": {
            "func": command_jsim,
            "desc": "%blue%Imports JS modules to wyper storage. %magenta%'jsim https://esm.run/html-escaper'%r%"
        },
        "todo": {
            "func": command_todo,
            "desc": "%blue%View the wyper todo listing.%r%"
        }
    },
    "state": {
        "running": False,
        "last_query": [],
        "last_result": ""
    },
    "opt": {
        "prompt": "%magenta%> %r%"
    },
    "storage": {
        "vars": {},
    }
}

prefix_wyper = f"%blue%[{context['info']['name']}]%reset% "
header = f"""
{prefix_wyper} %green%Connected to v.{context['info']['ver']}%bright_black%, Branch: {context['info']['branch']}, Rel: {context['info']['rel']}%r%
{prefix_wyper} %bright_black%Loading enviroment...%r%
"""
footer = f"""
{prefix_wyper} %bright_black%Exiting enviroment...%r%
%bright_black%Bya <3%r%
"""

def terminal():
    context["state"]["running"] = True

    while context["state"]["running"] == True:
        try:
            if (context["demo"]["is_shown"] != True):
                inputs = context["demo"]["input"]
                context["demo"]["is_shown"] = True
            else:
                input_strs = input(parse(context["opt"]["prompt"]))
                inputs = input_strs.split(";")
            execute_inputs(inputs)
        except Exception as e:
            print(parse(f"{prefix_wyper} %red%Error: {e}%r%"))

# FRWORK
def frwork_draw_resize_canvas():
    canvas = js.document.querySelector("#drawarea")
    div = js.document.querySelector("py-terminal")
  
    # Get the rendered size of the div
    rect = div.getBoundingClientRect()

    # Set the canvas size to match the div
    canvas.width = rect.width
    canvas.height = rect.height

    # Get the 2D context and set the background color
    ctx = canvas.getContext("2d")
    ctx.fillStyle = "#191a19"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

# Attach to window events
frwork_draw_resize_canvas()
window.addEventListener("resize", frwork_draw_resize_canvas)
# FRWORK

print(parse(header))

terminal()

while True:
    try:
        i = input(": ")
        for j in i.split(";"):
            if j.strip().lower() == context["info"]["name"].lower():
                terminal()
            elif j.strip() == "frwork.close()":
                window.close()
            elif j.strip() == "frwork.refresh()":
                window.location.reload()
            elif j.strip() == "frwork.term.clear()":
                __terminal__.clear()
            elif j.strip() == "?":
                print("Frwork-Wrapper 2025-02-15\n - wyper\n - frwork.close()\n - frwork.refresh()\n - frwork.term.clear()")
    except Exception as e:
        pass