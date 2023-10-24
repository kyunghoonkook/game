import React, { useState, useEffect, useRef } from "react";

const Canvas = (props) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(props.ball.x, props.ball.y, props.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.fillRect(
      props.paddle.x - props.paddle.width / 2,
      props.paddle.y - props.paddle.height / 2,
      props.paddle.width,
      props.paddle.height
    );

    for (let i = 0; i < props.blocks.length; i++) {
      let block = props.blocks[i];
      if (!block.destroyed) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(
          block.x - block.width / 2,
          block.y - block.height / 2,
          block.width,
          block.height
        );
      }
    }
  }, [props]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

function Game() {
  const [ball, setBall] = useState({
    x: 100,
    y: 100,
    radius: 10,
    dx: 3,
    dy: -3,
  });
  const [paddle, setPaddle] = useState({
    x: 400,
    y: 580,
    width: 75,
    height: 15,
  });
  const [blocks, setBlocks] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      x: (i + 1) * 120,
      y: 50,
      width: 100,
      height: 20,
    }))
  );

  useInterval(() => {
    setBall((ballState) => ({
      ...ballState,
      x: ballState.x + ballState.dx,
      y: ballState.y + ballState.dy,
    }));

    if (
      ball.x + ball.dx > 800 - ball.radius ||
      ball.x + ball.dx < ball.radius
    ) {
      setBall((ball) => ({ ...ball, dx: -ball.dx }));
    }

    if (ball.y + ball.dy < ball.radius) {
      setBall((ball) => ({ ...ball, dy: -ball.dy }));
    } else if (ball.y + ball.dy > 600 - ball.radius) {
      if (
        ball.x > paddle.x - paddle.width / 2 &&
        ball.x < paddle.x + paddle.width / 2
      ) {
        setBall((ball) => ({ ...ball, dy: -Math.abs(ball.dy) }));
      } else {
        console.log("Game Over");
        resetGame();
      }
    }

    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];
      if (
        !block.destroyed &&
        ball.y - ball.radius < block.y + block.height / 2 &&
        ball.y + ball.radius > block.y - block.height / 2 &&
        ball.x + ball.radius > block.x - block.width / 2 &&
        ball.x - ball.radius < block.x + block.width / 2
      ) {
        setBall((ball) => ({ ...ball, dy: -ball.dy }));
        let newBlocks = [...blocks];
        newBlocks[i].destroyed = true;
        setBlocks(newBlocks);
      }
    }
  }, 10);

  useEffect(() => {
    const handleMove = (e) => {
      setPaddle((paddle) => ({ ...paddle, x: e.clientX }));
    };

    window.addEventListener("mousemove", handleMove);

    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const resetGame = () => {
    setBall({ x: 100, y: 100, radius: 10, dx: 3, dy: -3 });
    setPaddle({ x: 400, y: 580, width: 75, height: 15 });
    setBlocks(
      Array.from({ length: 5 }, (_, i) => ({
        x: (i + 1) * 120,
        y: 50,
        width: 100,
        height: 20,
      }))
    );
  };

  return (
    <div>
      <Canvas
        width={800}
        height={600}
        ball={ball}
        paddle={paddle}
        blocks={blocks}
      />
    </div>
  );
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default Game;
