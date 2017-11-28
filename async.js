'use strict';

exports.isStar = false;
exports.runParallel = runParallel;

const makeArrOfPromises = (jobs, timeout) => jobs.map(job => () =>
    new Promise(resolve => {
        job().then(resolve, resolve);
        setTimeout(() => resolve(new Error('Promise timeout')), timeout);
    }));

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (!jobs.length) {
            resolve([]);
        }
        const result = [];
        let finishedJobs = 0;
        let currentJob = 0;
        const promises = makeArrOfPromises(jobs, timeout);
        promises.slice(0, parallelNum)
            .forEach((promise, idx) => start(promise, idx));

        function start(promise) {
            const idx = currentJob++;
            const handler = data => finish(data, idx);
            promise().then(handler);
        }

        function finish(data, idx) {
            result[idx] = data;
            finishedJobs++;
            if (jobs.length === finishedJobs) {
                resolve(result);
            }
            start(promises[currentJob]);
        }
    });
}
