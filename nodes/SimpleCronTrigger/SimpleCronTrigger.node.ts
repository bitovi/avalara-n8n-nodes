import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class SimpleCronTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Simple Cron Trigger',
		name: 'simpleCronTrigger',
		icon: 'file:simple-cron-trigger.svg',
		group: ['trigger', 'schedule'],
		version: 1,
		description: 'Triggers the workflow on a simple cron schedule',
		eventTriggerDescription: '',
		activationMessage:
			'Your simple cron trigger will now trigger executions on the schedule you have defined.',
		defaults: {
			name: 'Simple Cron Trigger',
		},

		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName:
					'This workflow will run on the schedule you define here once you <a data-key="activate">activate</a> it.<br><br>For testing, you can also trigger it manually: by going back to the canvas and clicking \'execute workflow\'',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Schedule Type',
				name: 'scheduleType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Every Day',
						value: 'everyDay',
						description: 'Trigger every day at a specific time',
					},
					{
						name: 'Every Hour',
						value: 'everyHour',
						description: 'Trigger every hour',
					},
				],
				default: 'everyHour',
			},
			{
				displayName: 'Hour',
				name: 'hour',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 23,
				},
				default: 9,
				displayOptions: {
					show: {
						scheduleType: ['everyDay'],
					},
				},
				description: 'The hour of the day to trigger (0-23)',
			},
			{
				displayName: 'Minute',
				name: 'minute',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 59,
				},
				default: 0,
				displayOptions: {
					show: {
						scheduleType: ['everyDay'],
					},
				},
				description: 'The minute of the hour to trigger (0-59)',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const scheduleType = this.getNodeParameter('scheduleType') as string;
		
		let cronExpression: string;

		// Convert schedule type to cron expression
		switch (scheduleType) {
			case 'everyHour':
				cronExpression = '0 * * * *';
				break;
			case 'everyDay':
				const hour = this.getNodeParameter('hour') as number;
				const minute = this.getNodeParameter('minute') as number;
				cronExpression = `${minute} ${hour} * * *`;
				break;
			default:
				throw new NodeOperationError(this.getNode(), `Unknown schedule type: ${scheduleType}`);
		}

		// The trigger function to execute when the cron-time got reached
		// or when manually triggered
		const executeTrigger = () => {
			const now = new Date();
			const resultData = {
				timestamp: now.toISOString(),
				scheduledFor: cronExpression,
				triggerType: scheduleType,
				message: `Triggered at ${now.toLocaleString()}`,
			};

			this.emit([this.helpers.returnJsonArray([resultData])]);
		};

		// Only register cron job if not in manual mode
		if (this.getMode() !== 'manual') {
			try {
				// Register the cron job using n8n's built-in helper
				this.helpers.registerCron({ expression: cronExpression as any }, executeTrigger);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(), 
					`Invalid cron expression: ${cronExpression}. ${error.message}`,
					{
						description: 'Please check your cron expression syntax. You can use https://crontab.guru/ to validate it.',
					}
				);
			}
		}

		return {
			manualTriggerFunction: async () => executeTrigger(),
		};
	}
}
