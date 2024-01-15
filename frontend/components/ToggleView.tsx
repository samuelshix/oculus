import { Box, Flex, IconButton } from "@chakra-ui/react"
import { faBars, faSoap, faThLarge } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { set } from "date-fns"
import { useRef, useState } from "react"

export default function ToggleView() {
    const [targetLocation, setTargetLocation] = useState<number>(0);
    const toggleSelector = useRef(null);
    const handleGridSelect = () => {
        setTargetLocation(36);
    }
    function handleTableSelect(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        setTargetLocation(0);
    }

    function handleBubbleSelect(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        setTargetLocation(72);
    }

    return (
        <Flex justifyContent="space-between" borderRadius="xl" bg="rgba(0,0,0,.1)" px={2} py={1} mb={2} width="120px">
            <Box className="toggleSelector" ref={toggleSelector} style={{ transform: `translateX(${targetLocation}px)` }}></Box>
            <IconButton height={7} minWidth={8} className="toggle table" bg="white" aria-label='Table'
                icon={<FontAwesomeIcon icon={faBars} />}
                onClick={handleTableSelect}
            />
            <IconButton height={7} minWidth={8} className="toggle grid" bg="white" aria-label='Grid'
                icon={<FontAwesomeIcon icon={faThLarge} />}
                onClick={handleGridSelect}
            />
            <IconButton height={7} minWidth={8} className="toggle bubble" bg="white" aria-label='Bubble Chart'
                icon={<FontAwesomeIcon icon={faSoap} />}
                onClick={handleBubbleSelect}
            />
        </Flex>
    )
}