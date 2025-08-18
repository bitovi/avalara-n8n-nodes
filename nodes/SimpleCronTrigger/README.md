# Simple Cron Trigger Node

A simple trigger node for n8n that provides easy scheduling options for hourly and daily workflows.

## Features

- **Simple scheduling**: Choose between hourly or daily triggers
- **Daily scheduling**: Set specific hour and minute for daily triggers
- **Simple interface**: No complex configuration required

## Schedule Types

### Available Options
- **Every Hour**: Triggers at the top of every hour
- **Every Day**: Triggers daily at a specified time (configurable hour and minute)

## Output Data

When triggered, the node outputs:
- `timestamp`: ISO 8601 timestamp of when the trigger fired
- `scheduledFor`: The cron expression that was used
- `triggerType`: The schedule type that was selected
- `message`: A human-readable message about the trigger

## Usage

1. Add the "Simple Cron Trigger" node to your workflow
2. Choose your desired schedule type
3. Configure any additional parameters (for daily triggers or custom cron)
4. Activate your workflow
5. The trigger will fire according to your schedule

## Manual Testing

You can test the trigger manually by clicking "Execute workflow" in the n8n editor, even when the workflow is not activated.

## Examples

### Daily at 9 AM
- Schedule Type: `Every Day`
- Hour: `9`
- Minute: `0`

### Hourly Triggers
- Schedule Type: `Every Hour`
- No additional configuration needed

## Notes

- All times are in the timezone configured for your n8n instance
- The trigger will only fire when the workflow is activated
- This node is designed for workflows that don't need high-frequency triggers (less than hourly)
