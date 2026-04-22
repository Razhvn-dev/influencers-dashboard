import { Form, useActionData, useLoaderData } from "react-router";
import { useState } from "react";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const { errors } = actionData || loaderData;
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
          Influencer Management System
        </h1>
        
        <Form method="post">
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Shop Domain
            </label>
            <input
              type="text"
              name="shop"
              placeholder="myshop.myshopify.com"
              required
              autoFocus
              style={{
              width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
            }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
              Enter your Shopify shop domain
            </div>
          </div>

          {errors?.shop && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px 12px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {errors.shop}
      </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: isHovering ? '#0052a3' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Login
          </button>
        </Form>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '8px' }}>Need help?</p>
          <p>Make sure you have a valid Shopify development store</p>
    </div>
      </div>
    </div>
  );
}
