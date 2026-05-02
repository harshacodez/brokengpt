from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, AIMessage

chat = ChatBedrock(
    model_id="mistral.mixtral-8x7b-instruct-v0:1",
    model_kwargs={"temperature": 1, "max_tokens": 1700, "top_p": 0.9,  # Encourage diverse responses
                  "top_k": 50},
)

messages = [HumanMessage(content="Hey!!")]

# Calculate input tokens
input_tokens = sum(chat.get_num_tokens(message.content)
                   for message in messages)

response = chat.invoke(messages)

if isinstance(response, AIMessage):
    content = response.content
    # Calculate output tokens
    output_tokens = chat.get_num_tokens(content)
    print("Input tokens:", input_tokens)
    print("Output tokens:", output_tokens)
    print(content)
else:
    print("Unexpected response type:", type(response))
