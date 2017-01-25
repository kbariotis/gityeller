<p align="center">
    <img 
        src="https://rawgit.com/kbariotis/gityeller/master/app/logo.svg" 
        alt="GitYeller"
        width="250px"
        >
</p>

# GitYeller
Subscribe to your favorite Github repositories and get an email once there is
a new issue of a specific label.

I needed a way to watch out issues of common labels like "need help", 
"documentation", etc to contribute to my favorite repositories. 

[GitYeller](https://gityeller.com) is what I came up with.

## Development

GitYeller is divided in two parts. 

* The front server/client (`server` and `app` folders) application that uses React/Webpack and Node.js.

* The worker (`worker` folder) that constantly traverses the database and check against Github's API.

Once you have cloned the repository:

1. Update `config/default.json`. All you need for the frontend app is the Mongo URI
2. run `npm install` to install dependencies
3. run `npm run dev` to run the development server
4. run `node worker` to run the worker. Update config first.

## Contribute

Contributions are welcomed! 

Make sure that `npm test` passes and give me a [heads up](/issues) before you
start writing code!

## License

MIT License
