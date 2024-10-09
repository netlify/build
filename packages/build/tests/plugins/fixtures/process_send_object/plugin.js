import process from 'process';

export const onPreBuild = function () {
  process.send({});
}
