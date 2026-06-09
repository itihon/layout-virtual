import LiveCodes, { type EmbedOptions } from "livecodes/react";

interface PlaygroundProps {
  params: EmbedOptions['params'];
}

const Playground = (props: PlaygroundProps) => {
  return <LiveCodes style={{ width: '100%', resize: 'both' }} height="70vh" params={props.params} />;
};

export default Playground;