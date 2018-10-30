/** @format */

import {name as appName} from './app.json';
import {AppRegistry} from 'react-native';

import DefaultApp from './apps/default';
import MovieApp from './apps/movie';
import ProgramApp from './apps/programs';
import EpgApp from './apps/epg';

AppRegistry.registerComponent(appName, () => ProgramApp);
