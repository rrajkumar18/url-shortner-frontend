'use server';

interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export async function registerUser(formData: RegisterInput) {
	try {
		// Basic server-side validation
		if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
			return {
				success: false,
				message: 'All fields are required.',
			};
		}

		const backendUrl = process.env.BACKEND_URL;

		if (!backendUrl) {
			throw new Error('BACKEND_URL is not configured.');
		}

		const capitalizeFirstLetter = (value: string): string => {
			return value.charAt(0).toUpperCase() + value.slice(1);
		};

		const updatedFormData: RegisterInput = {
			...formData,
			firstName: capitalizeFirstLetter(formData.firstName),
			lastName: capitalizeFirstLetter(formData.lastName),
		};

		const response = await fetch(`${backendUrl}/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedFormData),
			cache: 'no-store',
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return {
				success: false,
				message:
				data.message || data.error || 'Registration failed.',
			};
		}

		return {
			success: true,
			message: data.message || 'Registration successful!',
		};
	} catch (error) {
		console.error('Registration error:', error);
		return {
			success: false,
			message: 'Unable to register. Please try again.',
		};
  	}
}
