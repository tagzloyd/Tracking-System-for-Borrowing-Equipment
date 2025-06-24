import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    // Use the CSU logo as an <img> for consistency with your main page
    return (
        <img
            {...props}
            src="https://www.carsu.edu.ph/wp-content/uploads/2024/10/CSU-logo-2-black-text-1-1.svg"
            alt="CSU Logo"
            style={{
                height: '56px', // Larger and clearer
                width: 'auto',
                display: 'block',
                ...props.style,
            }}
        />
    );
}
