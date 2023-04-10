import { Link } from "react-router-dom";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function NotFound() {
    return (
        <Segment placeholder>
            <Header icon>
                <Icon name='search' />
                We could not find what you are looking for. Please try a different one :)
            </Header>
            <Segment.Inline>
                <Button as={Link} to='/activities' content='Back to activities' />
            </Segment.Inline>
                
        </Segment>
    )
}