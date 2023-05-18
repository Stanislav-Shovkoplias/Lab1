# Express.js and EJS templates

Our task was:

* Learn about Express.js and EJS templates
* Create simple notes app, which will have:
  * Every entity in memory
  * Every entity will have it's own template
  * On entity's page we can add new, edit, delete and see all objects
  * Authorization is missing :(

## Q&A

1. Опишіть механізм наслідування в JavaScript.

In JavaScript, inheritance is a mechanism that allows objects to inherit properties and methods from other objects. It provides a way to create hierarchical relationships between objects, where a child object can inherit characteristics from a parent object.

JavaScript uses prototype-based inheritance, which means that each object has a prototype object from which it inherits properties and methods. The prototype object is like a blueprint or template for creating new objects. When a property or method is accessed on an object, JavaScript first looks for it in the object itself. If it doesn't find it, it then looks for it in the object's prototype, and continues up the prototype chain until it either finds the property or reaches the end of the chain.

2. Яку функцію виконує Express.js?

Express.js acts as a middleware layer between the web server and your application logic, providing a robust framework for handling HTTP requests and responses. It simplifies the process of defining routes, handling requests, and generating responses.

3. Що таке middleware? Наведіть приклади.

Middleware in the context of web development refers to functions that are executed between the server receiving a request and sending a response back to the client. It sits in the middle of this request-response cycle, hence the term "middleware." Middleware functions have access to the request and response objects and can perform various tasks such as modifying the request or response, processing data, or executing additional logic before passing the control to the next middleware or the final request handler.

4. Яка різниця між використанням шаблонізаторів для відображення і динамічними сторінками на основі JavaScript?

The main difference between using templating engines for rendering and dynamic JavaScript-based pages lies in how the content is generated and delivered to the client.

1) Templating Engines for Rendering:
Using templating engines involves server-side rendering (SSR), where the HTML content is generated on the server and sent as a complete page to the client. The templating engine combines the template file with the data provided and produces the final HTML, which is then sent to the client's browser. The client receives a fully rendered page and displays it.

2) Dynamic JavaScript-based Pages:
Dynamic JavaScript-based pages, also known as client-side rendering (CSR), involve sending a minimal HTML structure and using JavaScript to dynamically generate and update the content on the client-side. The server mainly acts as an API endpoint, providing data to the client, which is then rendered and manipulated using JavaScript.

5. Як можна позбутися дублювання елементів сторінок використовуючи шаблонізатори, які повторюються - футер, хедер та інші?

To eliminate duplication of common elements across pages using templating engines, you can leverage the concept of partials or includes. Partial templates allow you to define reusable sections of a page, such as headers, footers, navigation menus, and other shared components. Instead of duplicating the code for these elements in every page, you define them once and include them in multiple templates as needed.

1) Define a Partial Template:
Create a separate template file for the reusable component. For example, let's create a header.ejs file for the header component.

```html
<!-- header.ejs -->
<header>
  <!-- header content -->
</header>
```

2) Include the Partial in Other Templates:
In the templates where you want to include the header, you can use the syntax provided by the templating engine to include the partial template.

```html
<!-- home.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>Home</title>
</head>
<body>
  <% include header.ejs %>
  
  <!-- rest of the page content -->
</body>
</html>
```

3) Render the Templates:
When rendering the main template (e.g., home.ejs), the templating engine will automatically include the contents of the header.ejs partial in the appropriate location.
