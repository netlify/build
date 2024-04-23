// Copyright since 2020, FranckLdx. All rights reserved. MIT license.

import { RetryOptions } from "../options.ts";

export type RetryUtilsOptions = Exclude<RetryOptions<void>, "until">;
