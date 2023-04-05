/**
 * AdBlockerWarningWidget component.
 *
 * Site Kit by Google, Copyright 2023 Google LLC
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
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { ADSENSE_GA4_TOP_EARNING_PAGES_NOTICE_DISMISSED_ITEM_KEY as DISMISSED_KEY } from '../../constants';
import { CORE_USER } from '../../../../googlesitekit/datastore/user/constants';
import {
	MODULES_ANALYTICS,
	DATE_RANGE_OFFSET,
} from '../../../analytics/datastore/constants';
import { generateDateRangeArgs } from '../../../analytics/util/report-date-range-args';
import whenActive from '../../../../util/when-active';
import SourceLink from '../../../../components/SourceLink';
import SettingsNotice from '../../../../components/SettingsNotice';
import useViewOnly from '../../../../hooks/useViewOnly';
const { useSelect } = Data;

function DashboardTopEarningPagesWidgetGA4( { WidgetNull, Widget } ) {
	const viewOnlyDashboard = useViewOnly();

	const isDismissed = useSelect( ( select ) =>
		select( CORE_USER ).isItemDismissed( DISMISSED_KEY )
	);

	const { startDate, endDate } = useSelect( ( select ) =>
		select( CORE_USER ).getDateRangeDates( {
			offsetDays: DATE_RANGE_OFFSET,
		} )
	);

	const analyticsMainURL = useSelect( ( select ) => {
		if ( viewOnlyDashboard ) {
			return null;
		}
		return select( MODULES_ANALYTICS ).getServiceReportURL(
			'content-publisher-overview',
			generateDateRangeArgs( { startDate, endDate } )
		);
	} );

	if ( isDismissed ) {
		return <WidgetNull />;
	}

	const Footer = () => (
		<SourceLink
			className="googlesitekit-data-block__source"
			name={ _x( 'Analytics', 'Service name', 'google-site-kit' ) }
			href={ analyticsMainURL }
			external
		/>
	);

	return (
		<Widget Footer={ Footer }>
			<SettingsNotice
				notice={ __(
					'Top earning pages are not yet available in Google Analytics 4.',
					'google-site-kit'
				) }
				dismiss={ DISMISSED_KEY }
			>
				{ __(
					'Site Kit will notify you as soon as you can connect AdSense and Analytics again.',
					'google-site-kit'
				) }
			</SettingsNotice>
		</Widget>
	);
}

DashboardTopEarningPagesWidgetGA4.propTypes = {
	Widget: PropTypes.elementType.isRequired,
};

export default whenActive( { moduleName: 'adsense' } )(
	DashboardTopEarningPagesWidgetGA4
);
