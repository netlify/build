module.exports = {
  onInit({
    utils: {
      git: { commits, ...git },
    },
  }) {
    const commitsA = commits.map(({ parents, ...commit }) => ({ ...commit, parents: parents.slice(0, 4) }))
    console.log(JSON.stringify({ ...git, commits: commitsA }))
  },
}
