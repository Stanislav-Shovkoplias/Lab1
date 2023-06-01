# Lab 4. REST API and OpenAPI

Our task was:

* Learn about REST API and OpenAPI
* Based on the project in Lab3:
  * Create REST API server
  * Create OpenAPI server

## Q&A

1. REST stands for Representational State Transfer. The term "REST" was coined by Roy Fielding in his doctoral dissertation in 2000, where he introduced and defined the principles of the REST architectural style.

The name "Representational State Transfer" reflects the core idea of REST, which is to transfer the representation of a resource's state between a client and a server. In a RESTful architecture, resources are identified by unique URIs (Uniform Resource Identifiers) and can have different representations, such as JSON or XML, that are exchanged between the client and server.

The term "transfer" emphasizes the communication aspect of REST, where clients can request and retrieve representations of resources from a server using standardized HTTP methods like GET, POST, PUT, and DELETE. These methods are used to perform operations on the resources and change their state.

Overall, REST emphasizes the concept of treating resources as first-class citizens, allowing clients to interact with them through a stateless and uniform interface. The name "REST" captures the fundamental principles and concepts of this architectural style, making it a widely adopted approach for building web services and APIs.

2. Idempotence in the context of REST APIs refers to the property of an operation where multiple identical requests have the same effect as a single request. In other words, regardless of how many times you repeat the same request, the result should remain the same.

Idempotent operations are designed to ensure that performing the operation multiple times does not produce unintended side effects or alter the system state beyond the initial request. This property is crucial for building reliable and predictable systems.

In REST API, idempotence is typically associated with HTTP methods such as GET, PUT, and DELETE. Here's a brief explanation of idempotence for each of these methods:

  1. GET: The GET method is naturally idempotent since it retrieves a resource's representation without modifying the server state. Repeating the same GET request multiple times should not change the resource or have any side effects.

  2. PUT: The PUT method is idempotent when used for updating a resource. If you send the same PUT request multiple times, it should have the same effect as a single request. The resource will be updated with the provided data, and subsequent PUT requests with the same data will not cause any additional changes.

  3. DELETE: The DELETE method is idempotent as well. Sending multiple DELETE requests for the same resource should have the same effect as a single request—removing the resource. Additional DELETE requests will not alter the state further since the resource is already deleted.

It's important to note that POST method, used for creating resources, is not inherently idempotent. Each POST request typically creates a new resource, and repeating the same request multiple times may result in multiple resource creations. However, there can be specific cases where POST requests are designed to be idempotent by considering factors such as request uniqueness and server-side handling.

Ensuring idempotency in REST APIs is crucial for building reliable and scalable systems, as it allows for safe retrying of requests without unintended consequences. API developers should consider the idempotent nature of operations when designing and documenting their APIs.

3. In the laboratory, several HTTP methods are commonly used: GET, POST, PUT, and DELETE. Here's a description of their key features, including parameters, caching, and what is typically transmitted in the request body:

  1. GET:
    - Parameters: GET requests can include parameters in the URL query string, allowing clients to send additional information to the server.
    - Caching: GET requests are typically cacheable, meaning that the server or intermediary caches can store the response and serve it to subsequent requests, reducing the load on the server.
    - Request Body: GET requests do not have a request body. Data is not typically transmitted in the body for GET requests.

  2. POST:
    - Parameters: POST requests can include parameters in the request body, often in the form of form data or JSON payload. The parameters are used to send data to the server for processing or creating a new resource.
    - Caching: POST requests are not cacheable by default, as they are intended to have side effects on the server, such as creating or modifying resources.
    - Request Body: POST requests carry the payload or data in the request body, which contains the information to be processed by the server.

  3. DELETE:
    - Parameters: DELETE requests can include parameters in the URL or in the request body, similar to GET and POST requests. These parameters specify which resource(s) should be deleted.
    - Caching: DELETE requests are not cacheable by default, as they result in the removal of a resource.
    - Request Body: DELETE requests do not typically have a request body. The identification of the resource(s) to be deleted is usually specified in the request URL.

  4. PATCH:
    Parameters: PATCH requests can include parameters in the URL or in the request body. These parameters specify the specific modifications to be applied to an existing resource.
    Caching: PATCH requests are typically not cacheable by default, as they are intended to modify a portion of a resource, rather than replacing the entire resource.
    Request Body: PATCH requests carry the payload or data in the request body, which contains the specific changes to be made to the resource. Unlike PUT, which replaces the entire resource, PATCH is used for partial updates or modifications.

    These are general features and characteristics of the HTTP methods commonly used in the laboratory. It's important to note that the actual usage and behavior may vary depending on the specific application and server implementation.

4. PUT:
Purpose: The PUT method is used to update or replace an existing resource with the request payload. It essentially replaces the entire resource with the new representation provided in the request.
Idempotent: PUT requests are designed to be idempotent, meaning that sending the same request multiple times has the same effect as sending it once. If a resource with the specified identifier already exists, the request will update it, and if it doesn't exist, a new resource will be created.
Idempotent Key: PUT requests typically require the client to specify the identifier or key of the resource in the request URL to indicate which resource is being updated.

POST:
Purpose: The POST method is used to submit data to the server to create a new resource. It is also used to trigger actions or perform operations that are not strictly related to resource creation.
Non-idempotent: POST requests are not idempotent, meaning that sending the same request multiple times may result in different outcomes or create multiple resources with different identifiers.
Server-Generated Key: Unlike PUT, POST requests do not require the client to specify the identifier of the new resource. Instead, the server typically generates a new identifier for the created resource and includes it in the response.
In summary, the main difference between PUT and POST is that PUT is used to update or replace an existing resource, and it is idempotent. On the other hand, POST is used to create new resources or perform non-idempotent operations. PUT requires the client to specify the resource identifier in the request URL, while POST typically generates a new identifier on the server side.

5. Caching is beneficial for the following actions:

Read-intensive operations: Caching is particularly useful for read-intensive operations where the same data is requested frequently. By caching the response of these operations, subsequent requests can be served from the cache, reducing the need to fetch data from the original source.

Expensive or time-consuming operations: Caching is advantageous for operations that are computationally expensive or require significant time to process. By caching the result, subsequent requests can be served directly from the cache, avoiding the need to repeat the expensive operation.

Static content: Caching is effective for serving static content, such as images, CSS files, JavaScript files, and other static assets. Since static content rarely changes, caching can significantly improve the performance by delivering these resources from the cache instead of generating them dynamically.

API responses: Caching can be applied to API responses, especially for data that doesn't frequently change or has a long cache expiration time. This can reduce the load on the server and improve the response time for subsequent API requests.

Database queries: Caching the results of frequently executed database queries can greatly improve the performance of database-driven applications. By storing the query results in a cache, subsequent requests with the same query can be served from the cache, eliminating the need to execute the query again.

It's important to note that caching should be used judiciously and with consideration of the data's freshness requirements. Caching may not be suitable for data that requires real-time updates or when data consistency is crucial. Additionally, proper cache invalidation strategies should be implemented to ensure that cached data is updated when necessary.

6. In a REST API, the address for searching within a collection of objects of a particular entity can be represented using the following conventions:

  1. Using the HTTP GET method: To retrieve a filtered list of objects, the GET method is commonly used. The endpoint address typically follows the pattern:

   
   GET /entities
   

   For example, to retrieve all the subjects studied by a student, the address could be:

   
   GET /students/{student_id}/subjects
   

   Here, {student_id} represents the unique identifier of the student.

  2. Query parameters: Additional query parameters can be appended to the endpoint address to specify the search criteria or filtering options. For example, to search for subjects based on a specific grade level, the address could be:

   
   GET /students/{student_id}/subjects?grade_level=10
   

   Here, the grade_level is a query parameter that filters the subjects based on the specified grade level.

It's important to note that the specific address structure and query parameters may vary depending on the design of the REST API and the naming conventions chosen by the API developer. The examples provided above are just illustrative and can be adapted to fit the requirements and conventions of your specific API implementation.

7. 2XX (Success): These status codes indicate that the client's request was successfully received, understood, and processed by the server. Some common 2XX status codes in REST APIs include:

  200 OK: The request was successful, and the server has returned the requested data.
  201 Created: The request was successful, and a new resource was created.
  204 No Content: The request was successful, but there is no content to return.
  These status codes inform the client that their request was successfully handled, and they can proceed accordingly.

  3XX (Redirection): These status codes indicate that further action needs to be taken by the client to fulfill the request. Some common 3XX status codes in REST APIs include:

  301 Moved Permanently: The requested resource has been permanently moved to a new location.
  302 Found: The requested resource has been temporarily moved to a different location.
  304 Not Modified: The client's cached version of the resource is still valid, and no new content is returned.
  These status codes are used when a resource's location has changed or to optimize caching and reduce unnecessary data transfer.

  4XX (Client Error): These status codes indicate that there was an error on the client side of the request. Some common 4XX status codes in REST APIs include:

  400 Bad Request: The client's request was invalid or could not be understood by the server.
  401 Unauthorized: The client is not authenticated and needs to provide valid credentials.
  404 Not Found: The requested resource could not be found on the server.
  These status codes inform the client that there was an error in their request, and they need to address the issue or modify their request accordingly.

Anna, [1 Jun 2023 15:25:36]
8. HATEOAS, which stands for "Hypermedia as the Engine of Application State," is an architectural constraint in RESTful APIs. It emphasizes the use of hypermedia links to enable navigation and discoverability of resources within the API.

In the HATEOAS approach, the server includes hypermedia links in the responses it sends to clients. These links provide information about the available actions or transitions that the client can perform from the current resource state. The client dynamically traverses these links to access and interact with related resources.

Key characteristics of the HATEOAS approach include:

  1. Hypermedia Links: The API responses contain embedded hypermedia links that define the available actions or transitions. These links are typically represented using standardized formats such as Hypermedia Application Language (HAL), JSON-LD, or Atom Syndication Format.

  2. Dynamic Resource Navigation: The client doesn't need prior knowledge of the API's structure or specific URLs. Instead, it follows the hypermedia links provided in the responses to navigate to related resources or perform actions.

  3. Discoverability: HATEOAS enables discoverability by allowing clients to explore the API's capabilities dynamically. Clients can rely on the links embedded in the responses to discover and interact with resources without hard-coding specific URLs or relying on external documentation.

  4. Loose Coupling: By decoupling the client from the specific URLs and API structure, HATEOAS promotes loose coupling between the client and server. The server can evolve and introduce changes to resource URLs or structure without breaking client functionality as long as the hypermedia links remain consistent.

The HATEOAS approach enhances the flexibility and evolvability of RESTful APIs by providing a self-descriptive nature. Clients can navigate the API's resources and capabilities dynamically, reducing the coupling between client and server and promoting a more discoverable and flexible architecture.

9. In addition to the HATEOAS approach, there are several other approaches commonly used for implementing APIs. Some of these approaches include:

  1. RPC (Remote Procedure Call): RPC is a communication protocol that allows a client to invoke methods or procedures on a remote server. In this approach, API endpoints typically represent specific operations or actions, and clients make direct method calls to these endpoints. The emphasis is on invoking specific methods rather than navigating resources.

  2. GraphQL: GraphQL is a query language and runtime for APIs that enables clients to request specific data requirements and receive a structured response. Unlike REST, where clients often need to make multiple requests to fetch related data, GraphQL allows clients to specify the exact data they need in a single request. This approach provides more flexibility and reduces over-fetching or under-fetching of data.

  3. SOAP (Simple Object Access Protocol): SOAP is a protocol for exchanging structured information in web services using XML. SOAP APIs define specific XML-based messages for communication between clients and servers. They often involve the use of Web Services Description Language (WSDL) for service definition and XML Schema for data validation. SOAP APIs are more heavyweight and focused on formal contracts and strict message formats.

  4. Event-Driven Architecture: This approach emphasizes the exchange of events or messages between different components or services. Instead of direct client-server interactions, the API is built around the idea of publishing and subscribing to events. Clients can subscribe to specific events and receive notifications or data updates when those events occur. This approach is commonly used in event-driven systems and microservices architectures.

  5. Protocol Buffers and gRPC: Protocol Buffers is a language-agnostic binary serialization format developed by Google. It allows efficient and compact serialization of structured data. gRPC is a framework that uses Protocol Buffers as the interface definition language and provides high-performance, language-agnostic remote procedure calls (RPC) over various network protocols. It offers features such as bi-directional streaming and authentication.

These are just a few examples of different approaches for implementing APIs. Each approach has its own characteristics, trade-offs, and areas of applicability. The choice of the API implementation approach depends on factors such as the requirements of the system, the nature of data and interactions, performance considerations, and the preferences of the development team.