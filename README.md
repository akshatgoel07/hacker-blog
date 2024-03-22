
## API Reference

#### Create new Blog

```http
  POST /api/v1/blog/
```

#### Update Blog

```http
  PUT /api/v1/blog/
```
#### Retrive all Blog

```http
  PUT /api/v1/blog/bulk
```
#### Retrive one Blog with id

```http
  PUT /api/v1/blog/:id
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |



#### SignUp

```http
  PUT /api/v1/signup
```


#### SignIn

```http
  PUT /api/v1/signin
```
## Tech Stack

**Frontend:** 

* React

**Backend:** 

* Cloudflare workers in the backend

* Zod as the validation library

* Typescript as the language

* Prisma as the ORM, with connection pooling

* Postgres database

* JWT for authentication



