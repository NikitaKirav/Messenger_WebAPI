# Messenger. Server part.

![screenshot of Messenger](https://kirav.ru/images/articles/images_for_github/messenger_client/20220722152800screen-messenger-min.jpg)

This project is an example of [Messenger](https://kirav.ru/works/messenger/). It had educational purposes and now you can see a result in my code here. 
This is a big learning project with a lot of complex stuff. I take ideas from modern messengers and social networks and try to repeat the result as fully as possible.

At this moment it has the following opportunities:
1) Registration and login pages. You can register in system and see how it works.
2) Profile page with a posts list. You can upload your avatar and edit its frames. Edit status and user's information. You can add your post to any user's profile. Add likes or dislikes.
3) User's list page. You can follow and unfollow any user.
4) User's chat list. Here, you can find all your chats and follow the ones.

Project uses the following technologies:
- [ ] Frontend: React + Redux, Sagas, TypeScript
- [x] Backend: NodeJS + Express + Mongoose
- [ ] Database: MongoDb

Frontend and Backend part have unit and integration tests.

- [x] - current repository

Also you can find Dockerfile.prod in the project. You may use it if you like, it saves a lot of time.
This project was prepared with another big project [KiravRu_WebApi](https://github.com/NikitaKirav/KiravRu_WebApi). There you can find a file docker-compose.yml, nginx.conf and also some useful bash scripts (for Deployment Automation and getting free ssl for your site).

## Available Scripts

In the project directory, you can run:

### `npm run startDev`

Runs the app on port: 4040. For Development. Using node server.

### `npm run dev`

Runs the app on port: 4040. For Development. Using nodemon server.

### `npm run test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run start`

Run the app for production on port: 4040.