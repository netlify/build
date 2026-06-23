export const onBuild = ({ utils }) => {
  utils.deploy.env.add("DATABASE_URI", "postgresql://127.0.0.1/mydb")
  utils.deploy.env.add("DATABASE_PASSWORD", "secret-password", { isSecret: true })
}
