import { useState } from 'preact/hooks';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		// Add login logic here
		console.log('Login attempt:', { username, password });
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});

		if (response.ok) {
			const data = await response.json();
			console.log('Login successful:', data);
			globalThis.location.href = '/dashboard';
			// Redirect to dashboard or home page
		} else {
			alert('Invalid credentials');
		}
	};

	return (
		<div class='min-h-screen flex'>
			{/* Left Section */}
			<div class='w-1/2 bg-gray-200 flex items-center justify-center'>
				<img
					src='/assets/login.png' // Replace with your image path
					alt='Illustration'
					class='max-w-full max-h-96 object-contain'
				/>
			</div>

			{/* Right Section */}
			<div class='w-1/2 bg-white flex justify-center items-center'>
				<div class='w-full max-w-md p-8'>
					<img
						src='/assets/logo.png' // Replace with your logo path
						alt='USTP Claveria'
						class='h-16 mx-auto mb-4'
					/>
					<h1 class='text-2xl font-bold text-center mb-6'>
						Welcome Back!
					</h1>
					<form
						class='space-y-4'
						onSubmit={(e) => {
							e.preventDefault();
							handleLogin();
						}}
					>
						{/* Username Input */}
						<div>
							<label
								class='block text-sm font-medium mb-1'
								for='username'
							>
								Username
							</label>
							<input
								id='username'
								type='text'
								placeholder='Enter your username'
								value={username}
								onInput={(e) =>
									setUsername(e.currentTarget.value)}
								class='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600'
							/>
						</div>

						{/* Password Input */}
						<div>
							<label
								class='block text-sm font-medium mb-1'
								for='password'
							>
								Password
							</label>
							<div class='relative'>
								<input
									id='password'
									type={showPassword ? 'text' : 'password'}
									placeholder='Enter your password'
									value={password}
									onInput={(e) =>
										setPassword(e.currentTarget.value)}
									class='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600'
								/>
								<button
									type='button'
									class='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'
									onClick={() =>
										setShowPassword(!showPassword)}
								>
									{showPassword ? '🙈' : '👁️'}
								</button>
							</div>
						</div>

						{/* Login Button */}
						<button
							type='submit'
							class='w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600'
						>
							LOGIN
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
