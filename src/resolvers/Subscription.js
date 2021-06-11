function newLinkSubscribe (parent, args, context, info) {
  return context.pubsub.asyncIterator('NEW_LINK')
}

function newVoteSubscribe (parent, args, context, info) {
  return context.pubsub.asyncIterator('NEW_VOTE')
}

const newLink = {
  subscribe: newLinkSubscribe,
  resolve: payLoad => {
    return payLoad
  }
}

const newVote = {
  subscribe: newVoteSubscribe,
  resolve: payLoad => {
    return payLoad
  }
}

module.exports = {
  newLink,
  newVote
}
