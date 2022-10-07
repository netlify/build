// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
export class TooManyTries extends Error {
  constructor() {
    super("function did not complete within allowed number of attempts");
  }
  tooManyTries = true;
}

export function isTooManyTries(error: Error): error is TooManyTries {
  return (error as TooManyTries).tooManyTries === true;
}
