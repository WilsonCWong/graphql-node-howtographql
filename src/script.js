const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main () {
  const newLink = await prisma.link.create({ // eslint-disable-line no-unused-vars
    data: {
      description: 'Fullstack tutorial for GraphQL',
      url: 'www.howtographql.com'
    }
  })
  const allLinks = await prisma.link.findMany()
  console.log(allLinks)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
