/**
 * Tag Manager datastore fixtures.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies
 */
import containersAMPOnly from './get-containers--amp.json';
import containersWebOnly from './get-containers--web.json';
import liveContainerVersionWebWithVariable from './live-container-version--web-with-variable.json';
import liveContainerVersionWebGAWithVariable from './live-container-version--web-ga-with-variable.json';

export { default as accounts } from './accounts.json';
export { default as createContainer } from './create-container.json';
export { default as liveContainerVersion } from './live-container-version.json';

export const getContainers = {
	amp: containersAMPOnly,
	web: containersWebOnly,
	all: [
		...containersAMPOnly,
		...containersWebOnly,
	],
};

export const liveContainerVersions = {
	amp: {

	},
	web: {
		gaWithVariable: liveContainerVersionWebGAWithVariable,
		withVariable: liveContainerVersionWebWithVariable,
	},
};
