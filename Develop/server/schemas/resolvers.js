const { User } = require("../models");
const {ApolloError} = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const user = await User.findOne({_id: context.user._id});
                return user;
            } else {
                throw new ApolloError('You need to be Logged in!')
            }
        }
    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new ApolloError("No user found!");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new ApolloError('Incorrect credentials')
            }

            const token = signToken(user);

            return {token, user};
        },
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username: username, email: email, password: password});

            if (!user) {
                throw new ApolloError('Cannot Create user')
            }

            const token = signToken(user);
            return {token, user};
        },
        saveBook: async (parent,  { content: bookData } , context) => { //check to see if we should use context or just check logged in before query
            try {
                if (context.user) {
                    const updatedUser = await User.findOneAndUpdate(
                        {_id: context.user._id},
                        {$addToSet: { savedBooks: bookData }},
                        {new: true, runValidators: true}
                    );
                    return updatedUser;
                } else {
                    throw new ApolloError('You need to be Logged in!')
                }
            } catch (err) {
                throw new ApolloError('Error in saving book!')
            }
        },
        removeBook: async (parent, { bookId }, context) => {
            try {
                if (context.user) {
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id},
                        { $pull: {savedBooks: {bookId: bookId}}},
                        {new: true}
                    );
                    if (!updatedUser) {
                        throw ApolloError('Could not find User');
                    }
                    return updatedUser;
                } else {
                    throw new ApolloError('You need to be Logged in!')
                }
            } catch {
                throw new ApolloError('Error in removing book!')
            }
        }
    }
}

module.exports = { resolvers };