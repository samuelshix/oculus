import { FC } from 'react';
import ReactLoading from 'react-loading';
import { Text } from '@chakra-ui/react';
export interface LoadingProps {
    loading: boolean
}

const LoadingAnimation: FC<LoadingProps> = ({ loading = false }) => (
    <>
        {loading &&
            <>
                <Text fontSize="lg" fontWeight="light" color="black" mb={'-4'}>Loading</Text>
                <ReactLoading height={50} width={50} type={'cylon'} color={'black'} />
            </>
        }
    </>
);

export default LoadingAnimation;