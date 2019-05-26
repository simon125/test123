import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
} from 'react';
import axios from 'axios';
import { Grid, Loader, Container } from 'semantic-ui-react';

import Filters from './Filters';
import SortBar from './SortBar';
import HotelsList from './HotelsList';
import ChartSwitcher from './ChartSwitcher';
import { ONLINE_URL, BEDS_TYPE } from '../../utils/const';

const RatingChart = React.lazy(() => import('./RatingChart'));

const SelectHotel = props => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setLoadingState] = useState(true);
  const [sortState, setSortState] = useState('reviews');
  const [filtersState, setFiltersState] = useState({});
  const [showChart, toggleChartVisibilty] = useState(false);

  useEffect(() => {
    setLoadingState(true);
    fetch(ONLINE_URL)
      .then(response => response.json())
      .then(data => {
        setHotels(data.list);
        setLoadingState(false);
      });
  }, []);
  const filtredHotels = useMemo(() => {
    console.log('test');
    return applyFilter(filtersState, hotels);
  }, [filtersState, hotels]);
  const hotelsToDisplay = useMemo(() =>
    filtredHotels.sort(sortHotels[sortState])
  );
  const toggleChartCallback = useCallback(() =>
    toggleChartVisibilty(!showChart)
  );

  const handleChnageFilter = (value, checked) => {
    setFiltersState(prevState => ({ ...prevState, [value]: checked }));
  };
  const handleChnageSort = phrase => {
    setSortState(phrase);
  };

  return (
    <Container>
      <h1>TEST</h1>
      <SortBar sortField={sortState} setField={handleChnageSort} />
      <Layout>
        <Layout.Sidebar>
          <ChartSwitcher
            isChartVisible={showChart}
            switchChartVisible={toggleChartCallback}
          />
          <Filters
            count={countHotelsByBedType(hotels)}
            onChange={handleChnageFilter}
          />
        </Layout.Sidebar>
        <Layout.Feed isLoading={isLoading}>
          {showChart && (
            <Suspense fallback={<Loader active inline="centered" />}>
              <RatingChart data={prepareChartData(hotelsToDisplay)} />
            </Suspense>
          )}
          {isLoading ? (
            <Loader active inline="centered" />
          ) : (
            <HotelsList hotels={hotelsToDisplay} selectHotel={noop} />
          )}
        </Layout.Feed>
      </Layout>
    </Container>
  );
};

const noop = () => {};

function countHotelsByBedType(data) {
  return data.reduce(function(acc, v) {
    acc[v.room] = acc[v.room] ? acc[v.room] + 1 : 1;
    return acc;
  }, {});
}

function applyFilter(filters, data) {
  const isFilterSet = BEDS_TYPE.find(b => filters[b.value]);
  if (!isFilterSet) {
    return data;
  }
  const filtered = data.filter(h => filters[h.room]);
  return filtered;
}

function prepareChartData(hotels) {
  return hotels.map(h => ({
    rating: h.rating.average * 1,
    price: h.price.amount * 1,
    reviews: h.rating.reviews * 1,
    name: h.title * 1,
  }));
}
const sortHotels = {
  price: (a, b) => a.price.amount - b.price.amount,
  rating: (a, b) => b.rating.average - a.rating.average,
  reviews: (a, b) => b.rating.reviews - a.rating.reviews,
};

function applySort(hotels, sortField) {
  return hotels.sort(sortHotels[sortField]).concat([]);
}

const Layout = ({ children }) => (
  <Grid stackable divided>
    <Grid.Row>{children}</Grid.Row>
  </Grid>
);
const Sidebar = ({ children }) => (
  <Grid.Column width={4}>{children}</Grid.Column>
);

const Feed = ({ children }) => <Grid.Column width={12}>{children}</Grid.Column>;

Layout.Sidebar = Sidebar;
Layout.Feed = Feed;

export default SelectHotel;
