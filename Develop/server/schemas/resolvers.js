const { User } = require("../models");
const {AuthenticationError} = require('apollo-server-express');

const resolvers = {
    Query: {
        //uses context(AKA req) to get token from header, return user data that was
        //extracted from the token.
        me: async (parent, args, context) => {
            if(context.user) {
                return await User.findOne({_id: context.user._id}).populate('savedBooks');
            } else {
                throw new AuthenticationError('You need to be Logged in!')
            }
        }
    }
}