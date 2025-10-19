import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.webhookTest.deleteMany();
  await prisma.webhookAttempt.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.qrPayment.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  console.log('Dados existentes removidos');

  // Criar usuários
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        password: hashedPassword,
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados`);

  // Criar merchants
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        name: 'Loja Tech Brasil',
        apiKey: 'ltb_live_' + Math.random().toString(36).substring(2, 15),
        userId: users[0].id, 
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'SuperMercado Online',
        apiKey: 'smo_live_' + Math.random().toString(36).substring(2, 15),
        userId: users[1].id,
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Fashion Store',
        apiKey: 'fs_live_' + Math.random().toString(36).substring(2, 15),
        userId: users[2].id,
      },
    }),
  ]);

  console.log(`✅ ${merchants.length} merchants criados`);

  // Criar métodos de pagamento para cada merchant
  const paymentMethods: any[] = [];
  for (const merchant of merchants) {
    const methods = await Promise.all([
      prisma.paymentMethod.create({
        data: {
          type: 'PIX',
          description: 'Pagamento instantâneo via PIX',
          merchantId: merchant.id,
        },
      }),
      prisma.paymentMethod.create({
        data: {
          type: 'CREDIT_CARD',
          description: 'Cartão de crédito',
          merchantId: merchant.id,
        },
      }),
      prisma.paymentMethod.create({
        data: {
          type: 'DEBIT_CARD',
          description: 'Cartão de débito',
          merchantId: merchant.id,
        },
      }),
      prisma.paymentMethod.create({
        data: {
          type: 'BOLETO',
          description: 'Boleto bancário',
          merchantId: merchant.id,
        },
      }),
    ]);
    paymentMethods.push(...methods);
  }

  console.log(`✅ ${paymentMethods.length} métodos de pagamento criados`);

  // Criar QR Payments
  const qrPayments = await Promise.all([
    prisma.qrPayment.create({
      data: {
        codeString: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(2, 38) + '5204000053039865802BR5913Loja Tech6009SAO PAULO62070503***63041D3D',
        amount: 150.00,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 3600000), // 1 hora
        merchantId: merchants[0].id,
      },
    }),
    prisma.qrPayment.create({
      data: {
        codeString: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(2, 38) + '5204000053039865802BR5913SuperMercado6009SAO PAULO62070503***63042E4E',
        amount: 89.90,
        status: 'USED',
        expiresAt: new Date(Date.now() - 3600000), // expirado
        merchantId: merchants[1].id,
      },
    }),
    prisma.qrPayment.create({
      data: {
        codeString: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(2, 38) + '5204000053039865802BR5913Fashion Store6009SAO PAULO62070503***63043F5F',
        amount: 299.99,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 7200000), // 2 horas
        merchantId: merchants[2].id,
      },
    }),
  ]);

  console.log(`✅ ${qrPayments.length} QR payments criados`);

 // Criar pagamentos
const payments = await Promise.all([
  // Pagamento completado com PIX
  prisma.payment.create({
    data: {
      amount: 150.0,
      currency: 'BRL',
      status: 'COMPLETED',
      merchant: { connect: { id: merchants[0].id } },
      user: { connect: { id: users[0].id } },
      paymentMethod: { connect: { id: paymentMethods[0].id } },
    },
  }),

  // Pagamento com QR Code usado
  prisma.payment.create({
    data: {
      amount: 89.9,
      currency: 'BRL',
      status: 'COMPLETED',
      merchant: { connect: { id: merchants[1].id } },
      user: { connect: { id: users[1].id } },
      paymentMethod: { connect: { id: paymentMethods[4].id } },
      qrPayment: { connect: { id: qrPayments[1].id } },
    },
  }),

  // Pagamento pendente
  prisma.payment.create({
    data: {
      amount: 299.99,
      currency: 'BRL',
      status: 'PENDING',
      merchant: { connect: { id: merchants[2].id } },
      user: { connect: { id: users[2].id } },
      paymentMethod: { connect: { id: paymentMethods[9].id } },
    },
  }),

  // Pagamento processando
  prisma.payment.create({
    data: {
      amount: 450.0,
      currency: 'BRL',
      status: 'PROCESSING',
      merchant: { connect: { id: merchants[0].id } },
      user: { connect: { id: users[3].id } },
      paymentMethod: { connect: { id: paymentMethods[1].id } },
    },
  }),

  // Pagamento falhou
  prisma.payment.create({
    data: {
      amount: 199.9,
      currency: 'BRL',
      status: 'FAILED',
      merchant: { connect: { id: merchants[1].id } },
      user: { connect: { id: users[0].id } },
      paymentMethod: { connect: { id: paymentMethods[5].id } },
    },
  }),

  // Pagamento cancelado
  prisma.payment.create({
    data: {
      amount: 75.0,
      currency: 'BRL',
      status: 'CANCELED',
      merchant: { connect: { id: merchants[2].id } },
      user: { connect: { id: users[1].id } },
      paymentMethod: { connect: { id: paymentMethods[10].id } },
    },
  }),

  // Pagamento em USD
  prisma.payment.create({
    data: {
      amount: 99.99,
      currency: 'USD',
      status: 'COMPLETED',
      merchant: { connect: { id: merchants[0].id } },
      user: { connect: { id: users[2].id } },
      paymentMethod: { connect: { id: paymentMethods[1].id } },
    },
  }),

  // Pagamento em EUR
  prisma.payment.create({
    data: {
      amount: 149.99,
      currency: 'EUR',
      status: 'COMPLETED',
      merchant: { connect: { id: merchants[2].id } },
      user: { connect: { id: users[3].id } },
      paymentMethod: { connect: { id: paymentMethods[9].id } },
    },
  }),
]);

  console.log(`✅ ${payments.length} pagamentos criados`);

  // Criar eventos de webhook
  const webhookEvents = await Promise.all([
    // Webhook de pagamento completado (sucesso)
    prisma.webhookEvent.create({
      data: {
        eventType: 'payment.completed',
        payload: {
          paymentId: payments[0].id,
          amount: payments[0].amount,
          currency: payments[0].currency,
          timestamp: new Date().toISOString(),
        },
        status: 'SUCCESS',
        merchantId: merchants[0].id,
        paymentId: payments[0].id,
      },
    }),
    // Webhook de pagamento falhou (pendente)
    prisma.webhookEvent.create({
      data: {
        eventType: 'payment.failed',
        payload: {
          paymentId: payments[4].id,
          reason: 'Insufficient funds',
          timestamp: new Date().toISOString(),
        },
        status: 'PENDING',
        nextAttemptAt: new Date(Date.now() + 300000), // 5 minutos
        merchantId: merchants[1].id,
        paymentId: payments[4].id,
      },
    }),
    // Webhook retrying
    prisma.webhookEvent.create({
      data: {
        eventType: 'payment.processing',
        payload: {
          paymentId: payments[3].id,
          timestamp: new Date().toISOString(),
        },
        status: 'RETRYING',
        nextAttemptAt: new Date(Date.now() + 600000), // 10 minutos
        merchantId: merchants[0].id,
        paymentId: payments[3].id,
      },
    }),
    // Webhook failed
    prisma.webhookEvent.create({
      data: {
        eventType: 'payment.canceled',
        payload: {
          paymentId: payments[5].id,
          canceledBy: 'user',
          timestamp: new Date().toISOString(),
        },
        status: 'FAILED',
        merchantId: merchants[2].id,
        paymentId: payments[5].id,
      },
    }),
  ]);

  console.log(`✅ ${webhookEvents.length} webhook events criados`);

  // Criar tentativas de webhook
  const webhookAttempts = await Promise.all([
    // Tentativa bem-sucedida
    prisma.webhookAttempt.create({
      data: {
        webhookEventId: webhookEvents[0].id,
        status: 'SUCCESS',
        responseCode: 200,
        responseBody: JSON.stringify({ success: true, message: 'Webhook received' }),
      },
    }),
    // Tentativa falha
    prisma.webhookAttempt.create({
      data: {
        webhookEventId: webhookEvents[1].id,
        status: 'FAILED',
        responseCode: 500,
        responseBody: JSON.stringify({ error: 'Internal server error' }),
      },
    }),
    // Primeira tentativa de retry (falhou)
    prisma.webhookAttempt.create({
      data: {
        webhookEventId: webhookEvents[2].id,
        status: 'FAILED',
        responseCode: 503,
        responseBody: JSON.stringify({ error: 'Service unavailable' }),
      },
    }),
    // Segunda tentativa de retry (também falhou)
    prisma.webhookAttempt.create({
      data: {
        webhookEventId: webhookEvents[2].id,
        status: 'FAILED',
        responseCode: 504,
        responseBody: JSON.stringify({ error: 'Gateway timeout' }),
      },
    }),
    // Múltiplas tentativas para webhook failed
    prisma.webhookAttempt.create({
      data: {
        webhookEventId: webhookEvents[3].id,
        status: 'FAILED',
        responseCode: 404,
        responseBody: JSON.stringify({ error: 'Endpoint not found' }),
      },
    }),
  ]);

  console.log(`✅ ${webhookAttempts.length} webhook attempts criados`);

  // Criar testes de webhook
  const webhookTests = await Promise.all([
    prisma.webhookTest.create({
      data: {
        webhookEventId: webhookEvents[0].id,
        sent: true,
      },
    }),
    prisma.webhookTest.create({
      data: {
        webhookEventId: webhookEvents[1].id,
        sent: false,
      },
    }),
  ]);

  console.log(`✅ ${webhookTests.length} webhook tests criados`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   - ${users.length} usuários`);
  console.log(`   - ${merchants.length} merchants`);
  console.log(`   - ${paymentMethods.length} métodos de pagamento`);
  console.log(`   - ${qrPayments.length} QR payments`);
  console.log(`   - ${payments.length} pagamentos`);
  console.log(`   - ${webhookEvents.length} webhook events`);
  console.log(`   - ${webhookAttempts.length} webhook attempts`);
  console.log(`   - ${webhookTests.length} webhook tests`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
