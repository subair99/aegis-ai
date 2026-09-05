import asyncio
import httpx
import json

async def test_analyze():
    url = "http://localhost:8000/analyze"
    payload = {
        "name": "Acme Corp - Q3 Reconciliation",
        "text": "DOCUMENT 1: MASTER SERVICE AGREEMENT (Contract)\nClient: Acme Corp. Service: Premium Support Package. Fee: $12,000 per month, billed on the 1st. Auto-renews annually unless canceled with 30 days notice.\n\nDOCUMENT 2: INVOICE #1042\nDate: Sept 1, 2026. Client: Acme Corp. Description: Standard Support Package. Amount Due: $9,000. Paid: $9,000.\n\nDOCUMENT 3: CLIENT EMAIL (From: john@acmecorp.com, Date: Aug 28, 2026)\nSubject: Re: September Support\n'Hi team, thanks for the great work in August. Please continue the Premium Support package for September as discussed, we will need the 24/7 coverage for our upcoming launch.'\n\nDOCUMENT 4: INTERNAL SLACK LOG\nAgent: 'Acme Corp is on the $9k Standard plan, right?' \nManager: 'No, they upgraded to Premium ($12k) in July. Make sure it's reflected.'"
    }
    
    print("🚀 Sending request to backend... (this may take 30-60 seconds)")
    
    # Increased timeout to 120 seconds for slow LLM responses
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(url, json=payload)
            print(f"✅ Received response! Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("\n🎉 Success! Response:")
                print(json.dumps(response.json(), indent=2))
            else:
                print("\n❌ Error! The server returned:")
                print(response.text)
        except httpx.ReadTimeout:
            print("\n⏱️ TIMEOUT: The backend took longer than 120 seconds to respond.")
            print("👉 Check your backend terminal for errors, and verify your MAIN_API_KEY in .env is valid.")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(test_analyze())