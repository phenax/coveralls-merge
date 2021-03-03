import {parse} from './parse';
import {merge} from './merge';
import {post} from './post';
import {getProgramConfig} from './util/config';

module.exports = (reports, givenConfig = {}) => {
    const config = getProgramConfig(givenConfig);
    const reportPromises = reports.map(report => parse(report, config));

    Promise.all(reportPromises)
        .then(results => {
            const mergedResults = merge(results);

            if (!config.dry) {
                post(mergedResults);
            } else {
                console.log(`[DRY RUN] Merged ${reports.length} reports`);
            }
        })
        .catch(error => {
            console.log('Error:', error);
            console.log(error.stack);
        });
};
