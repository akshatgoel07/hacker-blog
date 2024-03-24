```
npm install
npm run dev
```

```
npm run deploy
```


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
