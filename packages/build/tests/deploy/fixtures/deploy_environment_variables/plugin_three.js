
export const onBuild = ({ utils }) => {
  utils.deploy.env.add("DATABASE_URI", "")
}
