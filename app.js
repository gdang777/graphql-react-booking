const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express();
const mongoose = require('mongoose');
// const events = [];

const Event = require('./models/event');

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }
      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }
      type RootQuery{
        events: [Event!]!
      }

      type RootMutation{
        createEvent(eventInput: EventInput): Event
      }

      schema {
        query:RootQuery
        mutation:RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events.map(event => {
             return{ ... event._doc };
            });
          })
          .catch(err => {
            throw err;
          })
        },
      createEvent: (args) => {
        // const event = {
        //   _id: Math.random().toString(),
        //   title: args.eventInput.title,
        //   description: args.eventInput.description,
        //   price: args.eventInput.price,
        //   date: args.eventInput.date
        // };
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        console.log(args);
        return event
          .save()
          .then(result => {
            console.log(result);
            return {...result._doc, _id: result._doc._id.toString()};
          })
          .catch(err => {
            console.log(err);
            throw err;
          })
          // mongoose db method
        // events.push(event);
      }
    },
    graphiql: true
  })
);
mongoose
  .connect(`mongodb+srv://gdang:Email321$@cluster0-wzqkv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(3000, () => console.log("Server is listening at port 3000"));
  })
  .catch(err => {
    console.log(err);
  });
