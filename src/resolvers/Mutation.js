const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function signup (parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)

  const user = await context.prisma.user.create({ data: { ...args, password } })

  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

  return {
    token,
    user
  }
}

async function login (parent, args, context, info) {
  const user = await context.prisma.user.findUnique({ where: { email: args.email } })
  if (!user) {
    throw new Error('No such user found.')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password.')
  }

  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

  return {
    token,
    user
  }
}

async function post (parent, args, context, info) {
  const { userId, prisma } = context

  const newLink = await prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } }
    }
  })
  context.pubsub.publish('NEW_LINK', newLink)

  return newLink
}

async function updateLink (parent, args, context) {
  const { userId, prisma } = context

  const poster = await prisma.link.findUnique({ where: { id: parseInt(args.id) } }).postedBy()

  if (poster.id !== userId) {
    throw new Error('This is not your link!')
  }

  return await prisma.link.update({
    where: {
      id: parseInt(args.id)
    },
    data: {
      description: args.description,
      url: args.url
    }
  })
}

async function deleteLink (parent, args, context) {
  const { userId, prisma } = context

  const poster = await prisma.link.findUnique({ where: { id: parseInt(args.id) } }).postedBy()

  if (poster.id !== userId) {
    throw new Error('This is not your link!')
  }

  return await prisma.link.delete({
    where: {
      id: parseInt(args.id)
    }
  })
}

async function vote (parent, args, context, info) {
  const { userId, prisma } = context

  const vote = await prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId
      }
    }
  })

  if (vote) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  const newVote = prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } }
    }
  })
  context.pubsub.publish('NEW_VOTE', newVote)

  return newVote
}

module.exports = {
  signup,
  login,
  post,
  updateLink,
  deleteLink,
  vote
}
