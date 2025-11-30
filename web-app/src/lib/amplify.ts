// AWS Amplify Configuration
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-config';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: awsConfig.cognito.userPoolId,
        userPoolClientId: awsConfig.cognito.userPoolClientId,
      },
    },
  });
}
