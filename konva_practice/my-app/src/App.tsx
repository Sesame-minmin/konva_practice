import React from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";

function App() {
  return (
    <Stage width={window.innerWidth / 2} height={window.innerHeight}>
      <Layer>
        <Rect
          fill="brack"
          width={window.innerWidth}
          height={window.innerHeight}
        />
        <Circle
          x={window.innerWidth / 4}
          y={window.innerHeight / 2.5}
          radius={220}
          fill="brack"
        />
        <Circle
          x={window.innerWidth / 4}
          y={window.innerHeight / 2.5}
          radius={200}
          fill="red"
        />
        <Circle
          x={window.innerWidth / 4}
          y={window.innerHeight / 1.75}
          radius={250}
          fill="brack"
        />
        <Circle
          x={window.innerWidth / 4}
          y={window.innerHeight / 1.75}
          radius={210}
          fill="white"
        />
      </Layer>
    </Stage>
  );
}

export default App;
