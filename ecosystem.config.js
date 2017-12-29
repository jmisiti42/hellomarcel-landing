module.exports = {
	apps: [{
		name: 'server',
		script: './index.js'
	}],
	deploy: {
		production: {
		  user: 'ubuntu',
		  host: 'ec2-35-158-165-92.eu-central-1.compute.amazonaws.com',
		  key: '.ssh/aws-marcel.pem',
		  ref: 'origin/master',
		  repo: 'git@github.com:jmisiti42/hellomarcel-landing.git',
		  path: '/home/ubuntu/server',
		  'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
		}
	}
}
