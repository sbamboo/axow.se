# Article Viewer Project Structure

This project is organized into a clear and modular structure to maintain separation of concerns and ease of maintenance.

## Root Directory
- `index.html`: Main entry point with a button leading to the articles section
- `css/`: Contains styles for the main page
- `js/`: Contains JavaScript for the main page
- `assets/`: Global assets like images and the favicon

## Articles Section (`/articles`)
- `index.html`: Displays all available articles in a grid layout
- `viewer.html`: Article viewer page that renders markdown content
- `articles.json`: Configuration file listing all available articles

### Subdirectories
- `js/`: JavaScript files for article functionality
  - `articles.js`: Handles article list display
  - `viewer.js`: Handles single article display
  - `utils/`: Utility functions for article handling
- `css/`: Stylesheets for article pages
- `-/`: Contains markdown files for articles, organized by category
- `assets/`: Article-specific assets
  - `articles/`: Article-specific images organized by category
  - `images/`: General images for the article section
- `profiles/`: User profile pages
  - Each profile has its own directory with an index.html

## Article Format
Articles are written in Markdown with metadata in a hidden paragraph:
```markdown
<p hidden meta>
Title: Article Title
Author: Author Name
AuthorImg: /path/to/image.png
AuthorTitle: Role
Banner: /path/to/banner.png
Favicon: /path/to/favicon.png
Tags: tag1,tag2,tag3
CreationDate: YYYY-MM-DD
UpdatedDate: YYYY-MM-DD
</p>
```

## Profile References
Articles can reference profiles using @username syntax, which automatically links to the user's profile page.