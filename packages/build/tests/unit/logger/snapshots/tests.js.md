# Snapshot report for `tests/unit/logger/tests.js`

The actual snapshot is saved in `tests.js.snap`.

Generated by [AVA](https://avajs.dev).

## System logger writes to file descriptor

> Snapshot 1

    `Hello world {"object":true,"problem":false} Something went wrong Error: Something went wrong␊
    STACK TRACE␊
    `

## System logger does not write to file descriptor when `debug: true`

> Snapshot 1

    `Hello world {"object":true,"problem":false} Something went wrong Error: Something went wrong␊
    STACK TRACE`
