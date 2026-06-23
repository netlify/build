export const onBuild = ({ utils }) => {
  utils.deploy.env.add("DATABASE_PASSWORD", "collision", { isSecret: true })
  utils.deploy.env.add("DATABASE_MOOD", "feisty", { isSecret: false })
}
