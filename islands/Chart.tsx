// deno-lint-ignore-file no-explicit-any
import { useEffect, useRef } from 'preact/hooks';

interface ChartProps {
	type: 'bar' | 'line' | 'pie' | 'bubble';
	data: any;
	options?: any;
}

export default function Chart({ type, data, options }: ChartProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!globalThis.Chart || !canvasRef.current) return;

		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;

		const chart = new globalThis.Chart(ctx, {
			type,
			data,
			options: {
				...options,
			},
		});

		return () => chart.destroy(); // Cleanup chart on component unmount
	}, [type, data, options]);

	return <canvas ref={canvasRef} class='w-full h-48'></canvas>;
}
