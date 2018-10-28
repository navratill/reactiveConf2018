/** @format */

import {name as appName} from './app.json';
import {AppRegistry} from 'react-native';

import DefaultApp from './apps/default';
import MovieApp from './apps/movie';
import ProgramApp from './apps/programs';
import ProgramApp2 from './apps/programs2';

AppRegistry.registerComponent(appName, () => ProgramApp2);
