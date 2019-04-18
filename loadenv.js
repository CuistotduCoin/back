const fs = require('fs');
const awsParamEnv = require('aws-param-env');

awsParamEnv.load('/cuistot', { region: 'eu-west-1' });

const content = `\
AWS_REGION_IRELAND=eu-west-1
DATABASE_HOST=${process.env['host']}
DATABASE_PORT=${process.env['port']}
DATABASE_NAME=${process.env['name']}
DATABASE_USERNAME=${process.env['username']}
DATABASE_PASSWORD=${process.env['password']}
STAGE=${process.env['stage']}
`;

console.log(content);

fs.writeFile('.env', content, (err) => {
  if (err) throw err;
  console.log('.env saved...');
});