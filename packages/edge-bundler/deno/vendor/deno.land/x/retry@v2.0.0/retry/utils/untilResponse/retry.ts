// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { retryAsyncHof } from "../tools.ts";

const until = <RETURN_TYPE extends Response>(
  lastResult: RETURN_TYPE,
): boolean => lastResult.ok;

export const retryAsyncUntilResponse = retryAsyncHof(until);
