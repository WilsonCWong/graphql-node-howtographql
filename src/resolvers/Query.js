
async function feed (parent, args, context, info) {
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.filter } }
        ]
      }
    : {}

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy
  })

  const count = await context.prisma.link.count({ where })

  return {
    links,
    count
  }
}

async function link (parent, args, context) {
  return await context.prisma.link.findUnique({
    where: {
      id: parseInt(args.id)
    }
  })
}

module.exports = {
  feed,
  link
}
