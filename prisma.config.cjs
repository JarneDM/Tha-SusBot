// CommonJS config for Prisma when repository uses ESM (package.json "type": "module")
module.exports = {
  schema: "prisma/schema.prisma",
  datasourceOverrides: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
