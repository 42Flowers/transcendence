import { useQuery } from 'react-query';
import { fetchChannels } from '../../api';

export const useChannelsQuery = () => useQuery('channels', fetchChannels);


