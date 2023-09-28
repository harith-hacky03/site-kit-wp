/**
 * LeastEngagingPagesWidget component.
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
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../../../googlesitekit/datastore/user/constants';
import {
	DATE_RANGE_OFFSET,
	MODULES_ANALYTICS_4,
} from '../../datastore/constants';
import {
	MetricTileTable,
	MetricTileTablePlainText,
} from '../../../../components/KeyMetrics';
import Link from '../../../../components/Link';
import { ZeroDataMessage } from '../../../analytics/components/common';
import { numFmt } from '../../../../util';
import whenActive from '../../../../util/when-active';
import ConnectGA4CTATileWidget from './ConnectGA4CTATileWidget';
import useViewOnly from '../../../../hooks/useViewOnly';
const { useSelect, useInViewSelect } = Data;

function LeastEngagingPagesWidget( props ) {
	const { Widget } = props;

	const viewOnlyDashboard = useViewOnly();

	const dates = useSelect( ( select ) =>
		select( CORE_USER ).getDateRangeDates( {
			offsetDays: DATE_RANGE_OFFSET,
		} )
	);

	const pageViewsReportOptions = {
		...dates,
		dimensions: [ 'pagePath' ],
		metrics: [ { name: 'screenPageViews' } ],
		orderby: [
			{
				metric: { metricName: 'screenPageViews' },
				desc: true,
			},
		],
	};

	const pageViewsReport = useInViewSelect( ( select ) =>
		select( MODULES_ANALYTICS_4 ).getReport( pageViewsReportOptions )
	);

	const medianIndex = parseInt( pageViewsReport?.rowCount / 2, 10 );
	const medianPageViews =
		parseInt(
			pageViewsReport?.rows?.[ medianIndex ]?.metricValues?.[ 0 ]?.value,
			10
		) || 0;

	const reportOptions = {
		...dates,
		dimensions: [ 'pagePath' ],
		metrics: [ 'bounceRate', 'screenPageViews' ],
		orderby: [
			{
				metric: { metricName: 'bounceRate' },
				desc: true,
			},
			{
				metric: { metricName: 'screenPageViews' },
				desc: true,
			},
		],
		metricFilters: {
			screenPageViews: {
				operation: 'GREATER_THAN_OR_EQUAL',
				value: { int64Value: medianPageViews },
			},
		},
		limit: 3,
	};

	const loadedPageViewsReport = useSelect( ( select ) =>
		select( MODULES_ANALYTICS_4 ).hasFinishedResolution( 'getReport', [
			pageViewsReportOptions,
		] )
	);

	const pageViewsReportError = useSelect( ( select ) =>
		select( MODULES_ANALYTICS_4 ).getErrorForSelector( 'getReport', [
			pageViewsReportOptions,
		] )
	);

	const report = useSelect( ( select ) => {
		if ( loadedPageViewsReport && ! pageViewsReportError ) {
			return select( MODULES_ANALYTICS_4 ).getReport( reportOptions );
		}
	} );

	const error = useSelect( ( select ) => {
		const reportError = select( MODULES_ANALYTICS_4 ).getErrorForSelector(
			'getReport',
			[ reportOptions ]
		);

		if ( pageViewsReportError && reportError ) {
			return [ pageViewsReportError, reportError ];
		}

		return pageViewsReportError || reportError || undefined;
	} );

	const titles = useInViewSelect( ( select ) =>
		! error
			? select( MODULES_ANALYTICS_4 ).getPageTitles(
					report,
					reportOptions
			  )
			: undefined
	);

	const loading = useSelect(
		( select ) =>
			! select( MODULES_ANALYTICS_4 ).hasFinishedResolution(
				'getReport',
				[ reportOptions ]
			) ||
			titles === undefined ||
			report === null ||
			! loadedPageViewsReport
	);

	const format = {
		style: 'percent',
		signDisplay: 'never',
		maximumFractionDigits: 1,
	};

	const { rows = [] } = report || {};

	const columns = [
		{
			field: 'dimensionValues.0.value',
			Component: ( { fieldValue } ) => {
				const url = fieldValue;
				const title = titles[ url ];
				// Utilizing `useSelect` inside the component rather than
				// returning its direct value to the `columns` array.
				// This pattern ensures that the component re-renders correctly based on changes in state,
				// preventing potential issues with stale or out-of-sync data.
				// Note: This pattern is replicated in a few other spots within our codebase.
				const serviceURL = useSelect( ( select ) => {
					return ! viewOnlyDashboard
						? select( MODULES_ANALYTICS_4 ).getServiceReportURL(
								'all-pages-and-screens',
								{
									filters: {
										unifiedPagePathScreen: url,
									},
									dates,
								}
						  )
						: null;
				} );

				if ( viewOnlyDashboard ) {
					return <MetricTileTablePlainText content={ title } />;
				}

				return (
					<Link
						href={ serviceURL }
						title={ title }
						external
						hideExternalIndicator
					>
						{ title }
					</Link>
				);
			},
		},
		{
			field: 'metricValues.0.value',
			Component: ( { fieldValue } ) => (
				<strong>{ numFmt( fieldValue, format ) }</strong>
			),
		},
	];

	return (
		<MetricTileTable
			Widget={ Widget }
			title={ __( 'Least engaging pages', 'google-site-kit' ) }
			loading={ loading }
			rows={ rows }
			columns={ columns }
			ZeroState={ ZeroDataMessage }
			error={ error }
			moduleSlug="analytics-4"
			infoTooltip={ __(
				'Pages with the highest bounce rate (visitors who left without any meaningful engagement with your site)',
				'google-site-kit'
			) }
		/>
	);
}

LeastEngagingPagesWidget.propTypes = {
	Widget: PropTypes.elementType.isRequired,
};

export default whenActive( {
	moduleName: 'analytics-4',
	FallbackComponent: ConnectGA4CTATileWidget,
} )( LeastEngagingPagesWidget );
