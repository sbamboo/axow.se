<p hidden meta>
Title: 1.21.7 Client Release
Author: @TheAxolot77
AuthorTitle: Author/Owner
Banner: banner.png
Favicon: favicon.png
CardBackground: banner.png
Tags: news,changelog,minecraft,mc,axo,client,community,mooare
CreationDate: 2025-07-23
UpdatedDate: 2025-07-23
</p>

## Standard Community Clients
Contains additional QoL features compared to the *Lite* clients.

<details>
    <summary>Mod Changes: (Since 1.21.5_Community_Client_U3.B2)</summary>

    <span style="color:red;font-weight:bold;">Missing Mods:</span>
        - `fabric-skyboxes`
        - `fabric-skyboxes-interop`
        - `show-me-your-skin`
        - `mixin-trace`
        - `continuity`
        - `modernfix`
        - `enhanced-block-entites`
        - `eating-animation`

    <span style="color:orange;font-weight:bold;">Skipped:</span>
        - `ArmorChroma` Not updated.

    <span style="color:green;font-weight:bold;">Added from previous backlog:</span>
        - `animatica`
        - `polytone`
</details>


## Lite Clients
The lite clients are more like optifine-alternatives with the additional content for community stuff like `Simple Voice Chat`.
And contains a lot of the same mods but less then the regular clients.

<details>
    <summary>Mod Changes: (Since 1.21.5_Community_Client_Lite_U3.B2)</summary>

    <span style="color:red;font-weight:bold;">Missing Mods: (Backlog)</span>
        - `fabric-skyboxes`
        - `fabric-skyboxes-interop`
        - `show-me-your-skin`
        - `mixin-trace`
        - `continuity`
        - `modernfix`
        - `enhanced-block-entites`

    <span style="color:green;font-weight:bold;">Added from previous backlog:</span>
        - `animatica`
        - `polytone`
</details>


## Mooare Clients
The mooare series are larger modpacks that contain additional mods that I like to play with or that I find usefull for development/server-management.
And contains all of the same mods as the regular clients but with a lot extra added.

<details>
    <summary>Mod Changes: (Since 1.21.5 Mooare U1 BETA1)</summary>

    <span style="color:red;font-weight:bold;">Missing Mods:</span>
        - `fabric-skyboxes`
        - `fabric-skyboxes-interop`
        - `show-me-your-skin`
        - `mixin-trace`
        - `continuity`
        - `modernfix`
        - `enhanced-block-entites`
        - `eating-animation`
        - `serverpack-unlocker`
        - `isometric-renders`
        - `nether-coords`
        - `xaeros-zoomout`

    <span style="color:green;font-weight:bold;">New Mods:</span>
        - `advanced-armor-bar`

    <span style="color:green;font-weight:bold;">Added from previous backlog:</span>
        - `animatica`
        - `polytone`

    <span style="color:orange;font-weight:bold;">Skipped:</span>
        - `ArmorChroma` Not updated.
        - `EnhancedTooltips` Not updated :(
        - `PetOwner` Not updated.
        - `BetterCommandBlockUI` Needs re-evaluation.
</details>
<br><br>

# Additional information

## Modslist
For a full modslist for each of the modpacks goto [mcc-web](https://sbamboo.github.io/mcc-web) and press `Open in modviewer` for any given modpack.


## Website update
There is now a new way to download my clients from [mcc-web](https://sbamboo.github.io/mcc-web), `Modpack (zip)` clicking this makes the website assemble a .zip archive of the modpack. **(This feature is experimental and will be improved further in the future)**

## A note regarding the NoChatReports mod
For a long time now my clients have included the [NoChatReports](https://modrinth.com/mod/no-chat-reports) mod, which disables Mojangs chat-reporting system *where possible* by removing the ability for servers to verify messages came from your Minecraft account, as I personally don't like their system. Some servers require chat-verification and you can still play on those servers with the mod/client, you will just get a message asking if you want to enable chat verification for that gameplay session.<br><br>

For servers that don't require chat-verification your messages may be listed as `Not Secure` this just means the server could not *securely* verify it was you. This if nothing to worry about but incase a server owners does not know what this means it is good if you know it's the `NoChatReports` mod. 

### Want to disable the mod?
You can always fully remove the mod by just removing it from your `/mods` folder.<br><br>

**Otherwise while playing you can:**<br>
1. Go the main-menu or pause-menu ingame and click `Mods`<br>
2. Search up `NoChatReports`<br>
3. Click the image of the mod or the *three-slider-button* (config button) on the right.<br>
4. Click `Enabled` to change it to false.<br>
5. Press `Save & Quit`<br>
6. Press `Done` to get back.<br>
*(If you change this while playing on a server or world, please disconnect and join again)*<br><br>

**Another option is:**<br>
While ingame with the mod enabled you can open chat and in the bottom right corner you should see a little icon.<br>
With just `NoChatReports` it looks something like:<br>
<img src="https://raw.githubusercontent.com/sbamboo/axow.se/refs/heads/main/articles/-/mc/axo/client/c/1.21.7/nochatreports_button.png"/><br>
Or if you have the `ChatReporingHelper` resourcepack enabled:<br>
<img src="https://raw.githubusercontent.com/sbamboo/axow.se/refs/heads/main/articles/-/mc/axo/client/c/1.21.7/nochatreports_button_whelper.png"/><br>
(The resourcepack is nowadays often enabled by default on my clients)<br><br>

Clicking this icon toggles between the different modes of operation for the mod, or what it calls `Signing Mode`:<br>
- `Default (Prompt)` Your messages are not reportable by default, if server requires it you will be asked.<br>
- `Never` Never allow your messages to be reported, if server requires it you can not chat.<br>
- `Always` You allways prefer having your messages be reportable, this is how it works without the mod.<br>
- `Prompt` Your messages are not reportable by default, if server requires it you will be asked.<br>
- `On Demand` Your messages will be reportable only if the server requires it.<br><br>

As you can see `Default (Prompt)` and `Prompt` are the same.<br>
**If you want to essentially disable the mod set the mode to `Always`.**