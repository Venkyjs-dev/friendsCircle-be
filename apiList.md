## Dev Tinder APIS

### authRouter

- POST /signup
- POST /login
- POST /logout

### profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

### connecionRequestRouter

- POST /request/send/:status/:userId
- POST /request/review/:status/:requestId

### userRouter

- GET /user/requests/received
- GET /user/connections
- GET /user/feed

status : ignored, interested, accepted, rejected
